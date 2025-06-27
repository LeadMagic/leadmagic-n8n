import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IHttpRequestOptions,
} from 'n8n-workflow';



import {
	emailOperations,
	emailValidateFields,
	emailFinderFields,
	personalEmailFields,
	socialToWorkEmailFields,
} from './descriptions/EmailDescription';

import {
	companyOperations,
	companySearchFields,
	companyFundingFields,
} from './descriptions/CompanyDescription';

import {
	profileOperations,
	profileSearchFields,
	emailToProfileFields,
	mobileFinderFields,
	peopleOperations,
	roleFinderFields,
	employeeFinderFields,
} from './descriptions/ProfileDescription';

import {
	jobOperations,
	jobSearchFields,
} from './descriptions/JobDescription';

import {
	advertisementOperations,
	googleAdsFields,
	metaAdsFields,
	b2bAdsFields,
	b2bAdDetailsFields,
} from './descriptions/AdvertisementDescription';

import {
	creditOperations,
} from './descriptions/CreditDescription';

export class LeadMagic implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LeadMagic',
		name: 'leadMagic',
		icon: 'file:leadmagic.png',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'B2B data enrichment and lead generation with email finding, company intelligence, and profile enrichment',
		defaults: {
			name: 'LeadMagic',
			color: '#5456DF',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'leadMagicApi',
				required: true,
			},
		],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '📧 Email',
						value: 'email',
						description: '🔍 Find & validate email addresses - Most popular feature',
					},
					{
						name: '🏢 Company',
						value: 'company',
						description: '🏛️ Company intelligence, funding data & business details',
					},
					{
						name: '👤 Profile',
						value: 'profile',
						description: '🎯 Professional profile enrichment & social data',
					},
					{
						name: '👥 People',
						value: 'people',
						description: '🔍 Find employees, roles & team members within companies',
					},
					{
						name: '💼 Job',
						value: 'job',
						description: '📋 Job posting discovery & recruitment intelligence',
					},
					{
						name: '📱 Advertisement',
						value: 'advertisement',
						description: '📊 Competitive ad intelligence across platforms',
					},
					{
						name: '💳 Credit',
						value: 'credit',
						description: '📈 API usage & credit management',
					},
				],
				default: 'email',
			},

			// Resource Operations
			...creditOperations,
			...emailOperations,
			...companyOperations,
			...profileOperations,
			...peopleOperations,
			...jobOperations,
			...advertisementOperations,

			// Resource Fields
			...emailValidateFields,
			...emailFinderFields,
			...personalEmailFields,
			...socialToWorkEmailFields,
			...companySearchFields,
			...companyFundingFields,
			...profileSearchFields,
			...emailToProfileFields,
			...mobileFinderFields,
			...roleFinderFields,
			...employeeFinderFields,
			...jobSearchFields,
			...googleAdsFields,
			...metaAdsFields,
			...b2bAdsFields,
			...b2bAdDetailsFields,

		],
	};



	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		// Handle single item processing (bulk mode will be handled in templates)
		for (let i = 0; i < items.length; i++) {
			try {
				let requestOptions: IHttpRequestOptions = {
					method: 'POST',
					body: {},
					url: '',
					json: true,
				};

				if (resource === 'credit') {
					if (operation === 'getCredits') {
						requestOptions.url = 'https://api.leadmagic.io/credits';
						requestOptions.body = {};
					}
				} else if (resource === 'email') {
					if (operation === 'validateEmail') {
						const inputMode = this.getNodeParameter('inputMode', i) as string;
						
						if (inputMode === 'bulk') {
							// Handle bulk email validation
							const bulkEmails = this.getNodeParameter('bulkEmails', i) as string;
							const emails = bulkEmails
								.split(/[\n,]+/)
								.map(email => email.trim())
								.filter(email => email.length > 0);
							
							if (emails.length > 1000) {
								throw new Error(`Too many emails provided. Maximum allowed: 1000, provided: ${emails.length}`);
							}
							
							// Process each email with rate limiting
							for (let emailIndex = 0; emailIndex < emails.length; emailIndex++) {
								const email = emails[emailIndex];
								
								const emailRequestOptions: IHttpRequestOptions = {
									method: 'POST',
									url: 'https://api.leadmagic.io/email-validate',
									body: { email },
									json: true,
								};

								try {
									const emailResponse = await this.helpers.requestWithAuthentication.call(
										this,
										'leadMagicApi',
										emailRequestOptions,
									);

									const emailExecutionData = this.helpers.constructExecutionMetaData(
										this.helpers.returnJsonArray(emailResponse as any),
										{ itemData: { item: i } },
									);

									returnData.push(...emailExecutionData);
									
									// Note: Rate limiting can be handled by n8n's native wait nodes
								} catch (emailError) {
									if (this.continueOnFail()) {
										const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
										const errorExecutionData = this.helpers.constructExecutionMetaData(
											this.helpers.returnJsonArray({ error: errorMessage, email }),
											{ itemData: { item: i } },
										);
										returnData.push(...errorExecutionData);
									} else {
										throw emailError;
									}
								}
							}
							continue; // Skip the normal processing for this item
						} else {
							// Handle single email validation
							const email = this.getNodeParameter('email', i) as string;
							const firstName = this.getNodeParameter('first_name', i) as string;
							const lastName = this.getNodeParameter('last_name', i) as string;

							requestOptions.url = 'https://api.leadmagic.io/email-validate';
							requestOptions.body = {
								email,
								...(firstName && { first_name: firstName }),
								...(lastName && { last_name: lastName }),
							};
						}
					} else if (operation === 'findEmail') {
						const firstName = this.getNodeParameter('first_name', i) as string;
						const lastName = this.getNodeParameter('last_name', i) as string;
						const domain = this.getNodeParameter('domain', i) as string;
						const companyName = this.getNodeParameter('company_name', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/email-finder';
						requestOptions.body = {
							first_name: firstName,
							last_name: lastName,
							...(domain && { domain }),
							...(companyName && { company_name: companyName }),
						};
					} else if (operation === 'findPersonalEmail') {
						const profileUrl = this.getNodeParameter('profile_url', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/personal-email-finder';
						requestOptions.body = {
							profile_url: profileUrl,
						};
					} else if (operation === 'socialToWorkEmail') {
						const profileUrl = this.getNodeParameter('profile_url', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/b2b-social-email';
						requestOptions.body = {
							profile_url: profileUrl,
						};
					}
				} else if (resource === 'company') {
					if (operation === 'searchCompany') {
						const searchMethod = this.getNodeParameter('searchMethod', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/company-search';
						requestOptions.body = {};

						if (searchMethod === 'domain') {
							const companyDomain = this.getNodeParameter('company_domain', i) as string;
							requestOptions.body = { company_domain: companyDomain };
						} else if (searchMethod === 'name') {
							const companyName = this.getNodeParameter('company_name', i) as string;
							requestOptions.body = { company_name: companyName };
						} else if (searchMethod === 'profile') {
							const profileUrl = this.getNodeParameter('profile_url', i) as string;
							requestOptions.body = { profile_url: profileUrl };
						}
					} else if (operation === 'getCompanyFunding') {
						const searchMethod = this.getNodeParameter('searchMethod', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/company-funding';
						requestOptions.body = {};

						if (searchMethod === 'domain') {
							const companyDomain = this.getNodeParameter('company_domain', i) as string;
							requestOptions.body = { company_domain: companyDomain };
						} else if (searchMethod === 'name') {
							const companyName = this.getNodeParameter('company_name', i) as string;
							requestOptions.body = { company_name: companyName };
						}
					}
				} else if (resource === 'profile') {
					if (operation === 'searchProfile') {
						const profileUrl = this.getNodeParameter('profile_url', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/profile-search';
						requestOptions.body = {
							profile_url: profileUrl,
						};
					} else if (operation === 'emailToProfile') {
						const workEmail = this.getNodeParameter('work_email', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/b2b-profile';
						requestOptions.body = {
							work_email: workEmail,
						};
					} else if (operation === 'findMobile') {
						const searchMethod = this.getNodeParameter('searchMethod', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/mobile-finder';
						requestOptions.body = {};

						if (searchMethod === 'profile') {
							const profileUrl = this.getNodeParameter('profile_url', i) as string;
							requestOptions.body = { profile_url: profileUrl };
						} else if (searchMethod === 'workEmail') {
							const workEmail = this.getNodeParameter('work_email', i) as string;
							requestOptions.body = { work_email: workEmail };
						} else if (searchMethod === 'personalEmail') {
							const personalEmail = this.getNodeParameter('personal_email', i) as string;
							requestOptions.body = { personal_email: personalEmail };
						}
					}
				} else if (resource === 'people') {
					if (operation === 'findRole') {
						const jobTitle = this.getNodeParameter('job_title', i) as string;
						const searchMethod = this.getNodeParameter('searchMethod', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/role-finder';
						requestOptions.body = {
							job_title: jobTitle,
						};

						if (searchMethod === 'name') {
							const companyName = this.getNodeParameter('company_name', i) as string;
							requestOptions.body.company_name = companyName;
						} else if (searchMethod === 'domain') {
							const companyDomain = this.getNodeParameter('company_domain', i) as string;
							requestOptions.body.company_domain = companyDomain;
						} else if (searchMethod === 'profile') {
							const companyProfileUrl = this.getNodeParameter('company_profile_url', i) as string;
							requestOptions.body.company_profile_url = companyProfileUrl;
						}
					} else if (operation === 'findEmployees') {
						const companyName = this.getNodeParameter('company_name', i) as string;
						const page = this.getNodeParameter('page', i) as number;
						const perPage = this.getNodeParameter('per_page', i) as number;

						requestOptions.url = 'https://api.leadmagic.io/employee-finder';
						requestOptions.body = {
							company_name: companyName,
							page,
							per_page: perPage,
						};
					}
				} else if (resource === 'job') {
					if (operation === 'findJobs') {
						requestOptions.url = 'https://api.leadmagic.io/jobs-finder';
						
						const body: any = {};
						
						const companyName = this.getNodeParameter('company_name', i) as string;
						const companyWebsite = this.getNodeParameter('company_website', i) as string;
						const jobTitle = this.getNodeParameter('job_title', i) as string;
						const location = this.getNodeParameter('location', i) as string;
						const experienceLevel = this.getNodeParameter('experience_level', i) as string;
						const jobDescription = this.getNodeParameter('job_description', i) as string;
						const countryId = this.getNodeParameter('country_id', i) as string;
						const page = this.getNodeParameter('page', i) as number;
						const perPage = this.getNodeParameter('per_page', i) as number;

						if (companyName) body.company_name = companyName;
						if (companyWebsite) body.company_website = companyWebsite;
						if (jobTitle) body.job_title = jobTitle;
						if (location) body.location = location;
						if (experienceLevel) body.experience_level = experienceLevel;
						if (jobDescription) body.job_description = jobDescription;
						if (countryId) body.country_id = countryId;
						if (page) body.page = page;
						if (perPage) body.per_page = perPage;

						requestOptions.body = body;
					} else if (operation === 'getJobCountries') {
						requestOptions.method = 'GET';
						requestOptions.url = 'https://api.leadmagic.io/job-country';
						requestOptions.body = undefined;
					} else if (operation === 'getJobTypes') {
						requestOptions.method = 'GET';
						requestOptions.url = 'https://api.leadmagic.io/job-types';
						requestOptions.body = undefined;
					}
				} else if (resource === 'advertisement') {
					if (operation === 'searchGoogleAds') {
						const searchMethod = this.getNodeParameter('searchMethod', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/google/searchads';
						requestOptions.body = {};

						if (searchMethod === 'domain') {
							const companyDomain = this.getNodeParameter('company_domain', i) as string;
							requestOptions.body = { company_domain: companyDomain };
						} else if (searchMethod === 'name') {
							const companyName = this.getNodeParameter('company_name', i) as string;
							requestOptions.body = { company_name: companyName };
						}
					} else if (operation === 'searchMetaAds') {
						const searchMethod = this.getNodeParameter('searchMethod', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/meta/searchads';
						requestOptions.body = {};

						if (searchMethod === 'domain') {
							const companyDomain = this.getNodeParameter('company_domain', i) as string;
							requestOptions.body = { company_domain: companyDomain };
						} else if (searchMethod === 'name') {
							const companyName = this.getNodeParameter('company_name', i) as string;
							requestOptions.body = { company_name: companyName };
						}
					} else if (operation === 'searchB2BAds') {
						const searchMethod = this.getNodeParameter('searchMethod', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/b2b/searchads';
						requestOptions.body = {};

						if (searchMethod === 'domain') {
							const companyDomain = this.getNodeParameter('company_domain', i) as string;
							requestOptions.body = { company_domain: companyDomain };
						} else if (searchMethod === 'name') {
							const companyName = this.getNodeParameter('company_name', i) as string;
							requestOptions.body = { company_name: companyName };
						}
					} else if (operation === 'getB2BAdDetails') {
						const adId = this.getNodeParameter('ad_id', i) as string;

						requestOptions.url = 'https://api.leadmagic.io/b2b/ad-details';
						requestOptions.body = {
							ad_id: adId,
						};
					}
				}

				const responseData = await this.helpers.requestWithAuthentication.call(
					this,
					'leadMagicApi',
					requestOptions,
				);

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData as any),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : String(error);
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: errorMessage }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
} 
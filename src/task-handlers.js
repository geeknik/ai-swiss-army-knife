// Task-specific handlers for different AI operations

const SOCIAL_MEDIA_LIMITS = {
  twitter: 280,
  facebook: 63206,
  linkedin: 3000,
  instagram: 2200
};

class TaskHandlers {
  // Code-related tasks
  static async handleCode(api, content, type) {
    const codeActions = {
      explain: {
        system: 'You are an expert programmer who explains code clearly and thoroughly.',
        user: 'Please explain this code in detail:\n\n{code}',
        options: {
          temperature: 0.3,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                language: { type: 'string' },
                explanation: { type: 'string' },
                keyPoints: { type: 'array', items: { type: 'string' } },
                suggestions: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      improve: {
        system: 'You are an expert programmer who improves code quality, performance, and security.',
        user: 'Please improve this code and explain the improvements:\n\n{code}',
        options: {
          temperature: 0.3,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                improvedCode: { type: 'string' },
                changes: { type: 'array', items: { type: 'string' } },
                reasoning: { type: 'string' }
              }
            }
          }
        }
      },
      generate: {
        system: 'You are an expert programmer who writes clean, efficient, and well-documented code.',
        user: 'Please generate code based on this requirement:\n\n{requirement}',
        options: {
          temperature: 0.5,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                explanation: { type: 'string' },
                usage: { type: 'string' }
              }
            }
          }
        }
      },
      test: {
        system: 'You are an expert in software testing who writes comprehensive, maintainable tests.',
        user: 'Please generate tests for this code:\n\n{code}',
        options: {
          temperature: 0.4,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                testCode: { type: 'string' },
                coverage: { type: 'array', items: { type: 'string' } },
                testCases: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    };

    const action = codeActions[type] || codeActions.explain;
    return await api.chat(
      [
        { role: 'system', content: action.system },
        { role: 'user', content: action.user.replace('{code}', content) }
      ],
      action.options
    );
  }

  // Analysis tasks
  static async handleAnalysis(api, content, type) {
    const analysisActions = {
      summarize: {
        system: 'You are an expert content summarizer who extracts key information while maintaining accuracy.',
        user: 'Please provide a comprehensive summary of:\n\n{content}',
        options: {
          temperature: 0.3,
          stream: true
        }
      },
      sentiment: {
        system: 'You are an expert in sentiment analysis and emotional intelligence.',
        user: 'Please analyze the sentiment and emotional tone of:\n\n{content}',
        options: {
          temperature: 0.2,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral', 'mixed'] },
                confidence: { type: 'number' },
                emotionalTones: { type: 'array', items: { type: 'string' } },
                keyPhrases: { type: 'array', items: { type: 'string' } },
                analysis: { type: 'string' }
              }
            }
          }
        }
      },
      data: {
        system: 'You are an expert data analyst who provides clear, actionable insights.',
        user: 'Please analyze this data and provide insights:\n\n{content}',
        options: {
          temperature: 0.2,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                keyMetrics: { 
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      metric: { type: 'string' },
                      value: { type: 'string' },
                      insight: { type: 'string' }
                    }
                  }
                },
                trends: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      },
      extract: {
        system: 'You are an expert in information extraction and organization.',
        user: 'Please extract and organize key information from:\n\n{content}',
        options: {
          temperature: 0.3,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                keyPoints: { type: 'array', items: { type: 'string' } },
                entities: { 
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      context: { type: 'string' }
                    }
                  }
                },
                topics: { type: 'array', items: { type: 'string' } },
                timeline: { 
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string' },
                      event: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      critique: {
        system: 'You are an expert reviewer who provides balanced, constructive criticism.',
        user: 'Please provide a detailed critique of:\n\n{content}',
        options: {
          temperature: 0.4,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                strengths: { type: 'array', items: { type: 'string' } },
                weaknesses: { type: 'array', items: { type: 'string' } },
                suggestions: { type: 'array', items: { type: 'string' } },
                rating: { 
                  type: 'object',
                  properties: {
                    overall: { type: 'number' },
                    criteria: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          score: { type: 'number' },
                          comment: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const action = analysisActions[type];
    if (!action) {
      throw new Error(`Unsupported analysis type: ${type}`);
    }

    return await api.chat(
      [
        { role: 'system', content: action.system },
        { role: 'user', content: action.user.replace('{content}', content) }
      ],
      action.options
    );
  }

  // Writing tasks
  static async handleWrite(api, content, type, options = {}) {
    const writeActions = {
      email: {
        system: 'You are an expert email composer who writes clear, professional emails.',
        user: 'Write an email based on this context:\n\n{content}',
        options: {
          temperature: 0.7,
          stream: true
        }
      },
      tweet: {
        system: 'You are a social media expert who creates engaging, concise posts.',
        user: `Create a tweet (max ${SOCIAL_MEDIA_LIMITS.twitter} chars) about:\n\n{content}`,
        options: {
          temperature: 0.8,
          max_tokens: Math.ceil(SOCIAL_MEDIA_LIMITS.twitter / 4)
        }
      },
      technical: {
        system: 'You are a technical writer who creates clear, precise documentation.',
        user: 'Create a technical document about:\n\n{content}',
        options: {
          temperature: 0.4,
          stream: true
        }
      },
      academic: {
        system: 'You are an academic writer who produces scholarly content following academic standards.',
        user: 'Write an academic piece about:\n\n{content}',
        options: {
          temperature: 0.3,
          stream: true,
          response_format: {
            type: 'json_object',
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                abstract: { type: 'string' },
                content: { type: 'string' },
                references: { 
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      citation: { type: 'string' },
                      doi: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      blogPost: {
        system: 'You are an expert blogger who creates engaging, informative content.',
        user: 'Write a blog post about:\n\n{content}',
        options: {
          temperature: 0.6,
          stream: true
        }
      }
    };

    const action = writeActions[type];
    if (!action) {
      throw new Error(`Unsupported writing type: ${type}`);
    }

    return await api.chat(
      [
        { role: 'system', content: action.system },
        { role: 'user', content: action.user.replace('{content}', content) }
      ],
      { ...action.options, ...options }
    );
  }

  // Research tasks
  static async handleResearch(api, content, type) {
    const researchActions = {
      deep: {
        system: 'You are a thorough researcher who provides comprehensive analysis and insights.',
        user: 'Please conduct in-depth research on:\n\n{content}',
        options: {
          temperature: 0.3,
          stream: true
        }
      },
      quick: {
        system: 'You are a researcher who quickly identifies key points and relevant information.',
        user: 'Please provide a quick research summary on:\n\n{content}',
        options: {
          temperature: 0.4,
          max_tokens: 500
        }
      }
    };

    // Continue research handling...
    // Would you like me to continue with more task handlers like meetings, translations, etc.?
  }
}
// utils/assistantUpgradeEvaluator.ts

export interface AssistantConfig {
  modelProvider?: string;
  model?: string;
  voiceProvider?: string;
  voiceModel?: string;
  transcriberProvider?: string;
  transcriberModel?: string;
  transcriberLanguage?: string;
  recordingEnabled?: boolean;
}

export interface UpgradeRecommendation {
  type: 'model' | 'voice' | 'transcriber';
  message: string;
  suggestion: string;
  provider: string;
  targetModel: string;
  targetLanguage?: string;
}

// Best models for each provider - easy to update when new models are released
const BEST_MODELS = {
  model: {
    'openai': 'gpt-4.1',
    'google': 'gemini-2.5-flash-preview-05-20'
    // Add more model providers and their best models here as needed
  },
  voice: {
    'cartesia': 'sonic-2',
    '11labs': 'eleven_flash_v2_5',
    'playht': 'Play3.0-mini'
    // Add more voice providers and their best models here as needed
  },
  transcriber: {
    'deepgram': 'nova-3'
    // Add more transcriber providers and their best models here as needed
  }
};

// Best language settings by provider
const BEST_LANGUAGES = {
  transcriber: {
    'deepgram': 'multi'
    // Add more transcriber providers and their best language settings here
  }
};

export function getUpgradeRecommendations(config: AssistantConfig): UpgradeRecommendation[] {
  const recommendations: UpgradeRecommendation[] = [];

  // Recording Recommendation
  if (config.recordingEnabled === false) {
    recommendations.push({
      type: 'recording',
      message: 'Recording is disabled for this assistant. Enabling recording is recommended for quality assurance and training.',
      suggestion: 'Enable recording',
      provider: 'all',
      targetModel: 'true'
    });
  }

  // Model Recommendations
  if (config.modelProvider && BEST_MODELS.model[config.modelProvider]) {
    const bestModel = BEST_MODELS.model[config.modelProvider];
    if (config.model !== bestModel) {
      recommendations.push({
        type: 'model',
        message: `Assistant is using ${config.modelProvider} but not the recommended ${bestModel} model.`,
        suggestion: `Change model to ${bestModel}`,
        provider: config.modelProvider,
        targetModel: bestModel
      });
    }
  }

  // Voice Recommendations
  if (config.voiceProvider && BEST_MODELS.voice[config.voiceProvider]) {
    const bestModel = BEST_MODELS.voice[config.voiceProvider];
    if (config.voiceModel !== bestModel) {
      recommendations.push({
        type: 'voice',
        message: `Voice provider is ${config.voiceProvider} but not using ${bestModel}, which is recommended.`,
        suggestion: `Change voice model to ${bestModel}`,
        provider: config.voiceProvider,
        targetModel: bestModel
      });
    }
  }

  // Transcriber Recommendations
  if (config.transcriberProvider && BEST_MODELS.transcriber[config.transcriberProvider]) {
    const bestModel = BEST_MODELS.transcriber[config.transcriberProvider];
    const bestLanguage = BEST_LANGUAGES.transcriber[config.transcriberProvider];
    
    if (config.transcriberModel !== bestModel || 
        (bestLanguage && config.transcriberLanguage !== bestLanguage)) {
      
      let message = `Transcriber provider is ${config.transcriberProvider}. `;
      let suggestion = `Change transcriber model to ${bestModel}`;
      
      if (bestLanguage) {
        message += `${bestModel} model with ${bestLanguage}-language is recommended.`;
        suggestion += ` and language to ${bestLanguage}`;
      } else {
        message += `${bestModel} is the recommended model.`;
      }
      
      recommendations.push({
        type: 'transcriber',
        message,
        suggestion,
        provider: config.transcriberProvider,
        targetModel: bestModel,
        ...(bestLanguage ? { targetLanguage: bestLanguage } : {})
      });
    }
  }

  return recommendations;
}

import { VapiProvider } from '../utils/providers/vapi';
import { CartesiaProvider } from '../utils/providers/cartesia';
import { PlayAIProvider } from '../utils/providers/playai';
import { OpenAIVoiceProvider } from '../utils/providers/openai';
import { WhisperProvider } from '../utils/providers/whisper';
import { SendGridProvider } from '../utils/providers/sendgrid';
import { PerplexityProvider } from '../utils/providers/perplexity';
import { BrightreeProvider } from '../utils/providers/brightree';

export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig();
  
  // Initialize all providers during server startup
  try {
    console.log('🚀 Initializing providers...');
    const startTime = performance.now();
    const timings: { provider: string; time: number; success: boolean; error?: any }[] = [];

    // Map of all available providers
    const availableProviders = {
      vapi: { name: 'Vapi', init: () => VapiProvider.initialize(config.vapiApiKey) },
      cartesia: { name: 'Cartesia', init: () => CartesiaProvider.initialize(config.cartesiaApiKey) },
      playai: { name: 'PlayAI', init: () => PlayAIProvider.initialize(config.playaiApiKey, config.playaiUserId) },
      openai: { name: 'OpenAI', init: () => OpenAIVoiceProvider.initialize(config.openaiApiKey) },
      whisper: { name: 'Whisper', init: () => WhisperProvider.initialize(config.whisperApiKey) },
      sendgrid: { name: 'SendGrid', init: () => SendGridProvider.initialize(config.sendgridApiKey) },
      perplexity: { name: 'Perplexity', init: () => PerplexityProvider.initialize(config.perplexityApiKey) },
      brightree: { name: 'Brightree', init: () => BrightreeProvider.initialize(config.brightree) },
    };

    // Get enabled providers from config
    const enabledProviderKeys = config.providers?.enabled || [];
    
    // Filter and initialize only enabled providers
    const providerInits = enabledProviderKeys
      .map(key => {
        const provider = availableProviders[key.toLowerCase()];
        if (!provider) {
          console.warn(`⚠️ Unknown provider '${key}' specified in ENABLED_PROVIDERS`);
          return null;
        }
        return provider;
      })
      .filter(Boolean);

    if (providerInits.length === 0) {
      console.warn('⚠️ No providers enabled. Set ENABLED_PROVIDERS env variable to enable providers.');
      return;
    }

    // Initialize each provider and measure its timing
    const initResults = await Promise.all(
      providerInits.map(async ({ name, init }) => {
        const start = performance.now();
        try {
          await init();
          const time = performance.now() - start;
          console.log(`✅ ${name}Provider initialized`);
          return { provider: name, time, success: true };
        } catch (error) {
          console.error(`❌ Failed to initialize ${name}Provider:`, error);
          return { provider: name, time: performance.now() - start, success: false, error };
        }
      })
    );

    const totalTime = performance.now() - startTime;

    // Log timing results
    console.log('\n📊 Provider Initialization Times:');
    console.table(initResults.map(t => ({ 
      Provider: t.provider, 
      'Time (ms)': t.time.toFixed(2), 
      Success: t.success 
    })));
    console.log(`\n⏱️  Total initialization time: ${totalTime.toFixed(2)}ms`);
    const successCount = initResults.filter(r => r.success).length;
    console.log(`🚀 ${successCount}/${initResults.length} providers initialized successfully\n`);

  } catch (error) {
    console.error('❌ Failed to initialize providers:', error);
    throw error;
  }
});

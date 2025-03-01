import { VapiProvider } from '../utils/providers/vapi';
import { CartesiaProvider } from '../utils/providers/cartesia';
import { PlayAIProvider } from '../utils/providers/playai';
import { OpenAIVoiceProvider } from '../utils/providers/openai';
import { WhisperProvider } from '../utils/providers/whisper';
import { SendGridProvider } from '../utils/providers/sendgrid';
import { PerplexityProvider } from '../utils/providers/perplexity';

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig();
  
  // Initialize all providers during server startup
  try {
    console.log('🚀 Initializing providers...');
    const startTime = performance.now();
    const timings: { provider: string; time: number }[] = [];

    // Initialize Vapi provider
    const vapiStart = performance.now();
    VapiProvider.initialize(config.vapiApiKey);
    timings.push({ provider: 'Vapi', time: performance.now() - vapiStart });
    console.log('✅ VapiProvider initialized');

    // Initialize Cartesia provider
    const cartesiaStart = performance.now();
    CartesiaProvider.initialize(config.cartesiaApiKey);
    timings.push({ provider: 'Cartesia', time: performance.now() - cartesiaStart });
    console.log('✅ CartesiaProvider initialized');

    // Initialize PlayAI provider
    const playaiStart = performance.now();
    PlayAIProvider.initialize(config.playaiApiKey, config.playaiUserId);
    timings.push({ provider: 'PlayAI', time: performance.now() - playaiStart });
    console.log('✅ PlayAIProvider initialized');

    // Initialize OpenAI provider
    const openaiStart = performance.now();
    OpenAIVoiceProvider.initialize(config.openaiApiKey);
    timings.push({ provider: 'OpenAI', time: performance.now() - openaiStart });
    console.log('✅ OpenAIProvider initialized');

    // Initialize Whisper provider
    const whisperStart = performance.now();
    WhisperProvider.initialize(config.whisperApiKey);
    timings.push({ provider: 'Whisper', time: performance.now() - whisperStart });
    console.log('✅ WhisperProvider initialized');

    // Initialize SendGrid provider
    const sendgridStart = performance.now();
    SendGridProvider.initialize(config.sendgridApiKey);
    timings.push({ provider: 'SendGrid', time: performance.now() - sendgridStart });
    console.log('✅ SendGridProvider initialized');

    // Initialize Perplexity provider
    const perplexityStart = performance.now();
    PerplexityProvider.initialize(config.perplexityApiKey);
    timings.push({ provider: 'Perplexity', time: performance.now() - perplexityStart });
    console.log('✅ PerplexityProvider initialized');


    const totalTime = performance.now() - startTime;

    // Log timing results
    console.log('\n📊 Provider Initialization Times:');
    console.table(timings.map(t => ({ 
      Provider: t.provider, 
      'Time (ms)': t.time.toFixed(2) 
    })));
    console.log(`\n⏱️  Total initialization time: ${totalTime.toFixed(2)}ms`);
    console.log('🚀 All providers initialized successfully\n');

  } catch (error) {
    console.error('❌ Failed to initialize providers:', error);
    throw error;
  }
});

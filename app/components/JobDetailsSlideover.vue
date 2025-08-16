<!-- components/JobDetailsSlideover.vue -->
<template>
	<USlideover side="right" destroy-on-close>
		<template #content>
			<UCard class="h-full overflow-y-auto">
				<template #header>
					<div class="flex items-center justify-between">
						<h3 class="text-lg font-semibold">
							{{ quickViewJob?.name }}
						</h3>
						<UButton
							icon="i-lucide-x"
							color="gray"
							variant="ghost"
							class="cursor-pointer"
							@click="emit('close')"
						/>
					</div>
				</template>

				<div v-if="quickViewJob" class="space-y-6">
					<!-- Progress Section -->
					<div class="space-y-2">
						<h4 class="font-medium">Progress</h4>
						<UProgress
							:value="quickViewJob.progress"
							:color="getProgressColor(quickViewJob)"
							size="lg"
							:animation="quickViewJob.status === 'completed' ? 'pulse' : 'carousel'"
						/>
						<div class="grid grid-cols-3 gap-4 mt-2">
							<div>
								<div class="text-sm text-gray-500">Total</div>
								<div class="font-medium">{{ quickViewJob.totalCalls }}</div>
							</div>
							<div>
								<div class="text-sm text-gray-500">Completed</div>
								<div class="font-medium">{{ quickViewJob.completedCalls }}</div>
							</div>
							<div>
								<div class="text-sm text-gray-500">Failed</div>
								<div class="font-medium">{{ quickViewJob.failedCalls }}</div>
							</div>
						</div>
					</div>

					<!-- Failed Numbers -->
					<!-- <div v-if="quickViewJob.failedNumbers?.length > 0">
						<h4 class="font-medium mb-2">Failed Numbers</h4>
						<UCard class="bg-gray-50">
							<div class="space-y-1">
								{{ JSON.parse(quickViewJob.failedNumbers || '[]').join(', ') }}
							</div>
						</UCard>
					</div> -->

					<!-- Phone Numbers -->
					<div>
						<h4 class="font-medium mb-2">Phone Numbers</h4>
						<CallTable :data="jobQueueWithVapiDetails" :quickView="true" :isLoadingTable="isLoadingTable" />
					</div>
				</div>
			</UCard>
		</template>
	</USlideover>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import type { Job } from "~/types";
	import { useCalls } from '@/composables/useCalls'
	
	const jobQueues = ref<any[]>([])

	const props = defineProps<{
		modelValue: boolean;
		jobId: string;
	}>();


	const emit = defineEmits<{
		"update:modelValue": [value: boolean];
	}>();

	const { calls, fetchCalls } = useCalls()
	const { assistants, fetchAssistants, getAssistantById } = useAssistants()
	const { jobState, getJobQueueByJobId } = useJobState()

	const isLoadingTable = ref(false)


	// Utility functions
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString();
	};

	const getJobIcon = (status: string) => {
		switch (status) {
			case "running":
				return "i-heroicons-play";
			case "paused":
				return "i-heroicons-pause";
			case "completed":
				return "i-heroicons-check";
			case "failed":
				return "i-heroicons-x-circle";
			default:
				return "i-heroicons-clock";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "running":
				return "primary";
			case "paused":
				return "yellow";
			case "completed":
				return "green";
			case "failed":
				return "red";
			default:
				return "gray";
		}
	};

	const getProgressColor = (job: Job) => {
		if (job.status === "failed") return "error";
		if (job.status === "completed") return "success";
		return "primary";
	};

  const getJobActivity = (job: Job) => {
  return [
    {
      title: `Job ${job.status}`,
      date: job.lastProcessedAt,
      icon: getJobIcon(job.status)
    },
    {
      title: `${job.completedCalls || 0} calls completed`,
      date: new Date(),
      icon: 'i-lucide-phone'
    },
    {
      title: `${job.failedCalls || 0} calls failed`,
      date: new Date(),
      icon: 'i-lucide-phone-off'
    }
  ]
	}

	
  const quickViewJob = computed(() => {
    return jobState.value.jobs.find((job) => job.id === props.jobId)
  })



	const jobQueueWithVapiDetails = computed(() => {
		return quickViewJob.value ? getJobQueueWithVapiDetails(quickViewJob.value) : [];
	});

	function getJobQueueWithVapiDetails(job: Job) {
		return jobQueues.value?.map((job_queue: any) => {
			const vapi_call = calls.value.find((call) => call.id === job_queue.vapiId);
			const assistant = vapi_call?.assistant || getAssistantById(job_queue.assistantId)?.name || "N/A";

			return {
				...job_queue,
				...vapi_call,
				assistant
			};
		});
	}

onMounted(async () => {
	isLoadingTable.value = true
	if(props.jobId) {
		jobQueues.value = await getJobQueueByJobId(props.jobId)
		const firstJobQueue = jobQueues.value[0]
		const lastJobQueue = jobQueues.value[jobQueues.value.length - 1]
		const isQueueInCalls = calls.value.some((call) => call.id === firstJobQueue?.vapiId)
		if(!isQueueInCalls) {
			const startDate = new Date(quickViewJob.value?.createdAt).getTime()
			await fetchCalls(startDate)
		}

		if(!assistants.value || assistants.value.length === 0) {
			await fetchAssistants()
		}
	}


	isLoadingTable.value = false
})

watch(() => props.jobId, async () => {
	isLoadingTable.value = true
	jobQueues.value = await getJobQueueByJobId(props.jobId)
	// Check if the job queues are in the calls value
	const firstJobQueue = jobQueues.value[0]
	const isQueueInCalls = calls.value.some((call) => call.id === firstJobQueue.vapiId)
	console.log(isQueueInCalls)
	if(!isQueueInCalls) {
		const startDate = new Date(quickViewJob.value?.createdAt).getTime()
		await fetchCalls(startDate)
	}

	isLoadingTable.value = false
})
</script>

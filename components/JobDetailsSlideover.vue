<!-- components/JobDetailsSlideover.vue -->
<template>
	<USlideover v-model:open="showQuickView" side="right">
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
							@click="showQuickView = false"
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
					<div v-if="quickViewJob.failedNumbers?.length > 0">
						<h4 class="font-medium mb-2">Failed Numbers</h4>
						<UCard class="bg-gray-50">
							<div class="space-y-1">
								<div v-for="number in quickViewJob.failedNumbers" :key="number" class="text-sm">
									{{ number }}
								</div>
							</div>
						</UCard>
					</div>

					<!-- Recent Activity -->
					<div>
						<h4 class="font-medium mb-2">Recent Activity</h4>
						<div class="space-y-3">
							<UCard
								v-for="activity in getJobActivity(quickViewJob)"
								:key="activity.id"
								class="flex gap-3 p-3"
							>
								<UIcon :name="activity.icon" class="h-5 w-5 text-gray-400" />
								<div class="flex-1 space-y-1">
									<p class="text-sm">{{ activity.title }}</p>
									<!-- <p class="text-xs text-gray-500">{{ formatDate(activity.timestamp) }}</p> -->
								</div>
							</UCard>
						</div>
					</div>

					<!-- Phone Numbers -->
					<div>
						<h4 class="font-medium mb-2">Phone Numbers</h4>
						<UTable :data="quickViewJob.jobQueues" :columns="jobQueueColumns" />
					</div>
				</div>
			</UCard>
		</template>
	</USlideover>
</template>

<script setup lang="ts">
	import { ref } from "vue";
	import type { Job } from "~/types";

	const props = defineProps<{
		modelValue: boolean;
		job?: Job | null;
	}>();

  const quickViewJob = defineModel<Job | null>('job', {
    required: true
  });

	const emit = defineEmits<{
		"update:modelValue": [value: boolean];
	}>();

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
		if (job.status === "failed") return "red";
		if (job.status === "completed") return "green";
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


const jobQueueColumns = [
  { accessorKey: 'name', header: 'Name', cell: ({ row }) => {
    return h('div', { class: 'text-sm text-gray-500' }, row.original.name || "N/A")
  } },
  { accessorKey: 'phoneNumber', header: 'Phone Number' },
  { accessorKey: 'retryCount', header: 'Retry Count' },
  { accessorKey: 'scheduledAt', header: 'Schedule At', cell: ({ row }) => {
    return h('div', { class: 'text-sm text-gray-500' }, new Date(row.original.scheduledAt).toLocaleString())
  }  },
  { accessorKey: 'status', header: 'Status' },
]
</script>

<script setup lang="ts">
import { availableLocales, getLocaleIcon } from '~/i18n/config'

const { locale, locales, setLocale, t } = useI18n()
const { status, signOut, session } = useAuth()
const switchLocalePath = useSwitchLocalePath()
const localeRoute = useLocaleRoute()

// Available locales for the dropdown
const availableLocaleItems = computed(() =>
    (locales.value || []).map(l => ({
        label: l.name,
        icon: getLocaleIcon(l.code),
        onSelect: () => setLocale(l.code),
        selected: l.code === locale.value
    }))
)

// Locale dropdown
const localeDropdown = computed(() => {
    const currentLocale = locales.value?.find(l => l.code === locale.value)
    return {
        label: currentLocale?.name || t('language'),
        icon: getLocaleIcon(currentLocale?.code || 'en'),
        children: availableLocaleItems.value
    }
})

// Navigation items
const items = computed(() => [
    {
        label: t('home'),
        icon: 'i-lucide-home',
        to: localeRoute('/')?.path
    },
    {
        label: t('calls'),
        icon: 'i-lucide-phone',
        description: t('manage-calls'),
        to: localeRoute('/calls')?.path
    },
    {
        label: t('assistants'),
        icon: 'i-lucide-bot',
        description: t('manage-assistants'),
        to: localeRoute('/assistants')?.path
    },
    {
        label: t('analytics'),
        icon: 'i-lucide-line-chart',
        description: t('review-statistics'),
        to: localeRoute('/analytics')?.path
    },
    {
        label: t('scheduling'),
        icon: 'i-lucide-calendar',
        description: t('manage-schedule'),
        to: localeRoute('/scheduling')?.path
    },
    
    {
        label: 'Demo',
        icon: 'i-lucide-layout-template',
        description: 'View demo pages',
        children: [
            {
                label: 'Translation',
                icon: 'i-lucide-languages',
                description: 'Translation demo',
                to: localeRoute('/demo/translation')?.path
            },
            {
                label: 'Patient Intake',
                icon: 'i-lucide-clipboard-list',
                description: 'Patient intake form demo',
                to: localeRoute('/demo/patient-intake-form')?.path
            }
        ]
    },
    {
        label: t('support'),
        icon: 'i-lucide-help-circle',
        children: [
            {
                label: t('help-center'),
                icon: 'i-lucide-life-buoy',
                description: t('get-help'),
                to: localeRoute('/help')?.path
            },
            {
                label: t('settings'),
                icon: 'i-lucide-settings',
                description: t('configure-preferences'),
                to: localeRoute('/settings')?.path
            }
        ]
    },
    {
        label: t('access-control.title'),
        icon: 'i-lucide-lock',
        to: localeRoute('/access-control')?.path
    },
    {
        label: t('dev-tools'),
        icon: 'i-lucide-wrench',
        children: [
            {
                label: t('view-api'),
                icon: 'i-lucide-file-json',
                to: localeRoute('/dev')?.path
            }
        ]
    },
    // Profile/Auth menu
    {
        label: session.value?.user?.name || t('profile'),
        icon: session.value?.user ? 'i-lucide-user' : 'i-lucide-key',
        children: session.value?.user ? [
            {
                label: session.value.user.email,
                icon: 'i-lucide-mail',
                disabled: true
            },
            {
                label: t('settings'),
                icon: 'i-lucide-settings',
                to: localeRoute('/settings')?.path
            },
            {
                label: t('logout'),
                icon: 'i-lucide-log-out',
                description: t('sign-out'),
                onClick: () => signOut({ redirect: true, callbackUrl: '/auth/login' })
            }
        ] : [
            {
                label: t('login'),
                icon: 'i-lucide-log-in',
                description: t('sign-in'),
                to: localeRoute('/auth/login')?.path
            }
        ]
    },

    localeDropdown.value,
    // {
    //     slot: 'locale-select',
    // },
    {
        slot: 'color-mode',
    }
])

const appConfig = useAppConfig()

const defaultColors = ref(['green', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet'].map(color => ({ label: color, chip: color, click: () => appConfig.ui.primary = color })))
const colors = computed(() => defaultColors.value.map(color => ({ ...color, active: appConfig.ui.primary === color.label })))
</script>

<template>
    <UPage>
        <slot />
    </UPage>
</template>
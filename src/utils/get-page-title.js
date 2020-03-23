import defaultSettings from '@/settings'

const title = defaultSettings.title || 'CMS'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}

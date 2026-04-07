import type { PageData, PageMeta, PageResponse } from '../models/api'

export function isPageResponse<T>(value: unknown): value is PageResponse<T> {
  const candidate = value as Partial<PageResponse<T>> | null
  return Boolean(
    candidate &&
      typeof candidate === 'object' &&
      Array.isArray(candidate.content) &&
      typeof candidate.totalElements === 'number' &&
      typeof candidate.totalPages === 'number' &&
      typeof candidate.size === 'number' &&
      typeof candidate.number === 'number',
  )
}

function buildMetaFromPage<T>(page: PageResponse<T>): PageMeta {
  return {
    totalElements: page.totalElements,
    totalPages: page.totalPages,
    size: page.size,
    page: page.number,
  }
}

function buildMetaFromArray<T>(items: T[]): PageMeta {
  return {
    totalElements: items.length,
    totalPages: items.length > 0 ? 1 : 0,
    size: items.length,
    page: 0,
  }
}

export function extractPageData<T>(value: unknown): PageData<T> {
  if (isPageResponse<T>(value)) {
    return {
      data: value.content,
      meta: buildMetaFromPage(value),
    }
  }

  if (Array.isArray(value)) {
    return {
      data: value as T[],
      meta: buildMetaFromArray(value as T[]),
    }
  }

  return {
    data: [],
    meta: {
      totalElements: 0,
      totalPages: 0,
      size: 0,
      page: 0,
    },
  }
}

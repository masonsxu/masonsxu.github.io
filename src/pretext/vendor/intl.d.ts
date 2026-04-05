declare global {
  interface Intl {
    Segmenter: {
      prototype: Intl.Segmenter
      new(locales?: string | string[], options?: Intl.SegmenterOptions): Intl.Segmenter
      supportedLocalesOf(locales: string | string[], options?: Intl.SegmenterOptions): string[]
    }
  }

  namespace Intl {
    type SegmenterGranularity = 'grapheme' | 'word' | 'sentence'
    type SegmenterLocaleMatcher = 'best fit' | 'lookup'

    interface SegmenterOptions {
      granularity?: SegmenterGranularity
      localeMatcher?: SegmenterLocaleMatcher
    }

    interface Segment {
      segment: string
      index: number
      input: string
      isWordLike?: boolean
    }

    interface Segmenter {
      segment(input: string): Iterable<Segment>
      resolvedOptions(): {
        granularity: SegmenterGranularity
        locale: string
      }
    }
  }
}

export {}

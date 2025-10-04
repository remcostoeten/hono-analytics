import { docs, meta } from '@/.source'
import { DocsPage, DocsBody } from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'

type TProps = {
  params: { slug?: string[] }
}

export default function Page({ params }: TProps) {
  const page = docs.getPage(params.slug)

  if (!page) notFound()

  const MDX = page.data.exports.default

  return (
    <DocsPage toc={page.data.exports.toc}>
      <DocsBody>
        <h1>{page.data.title}</h1>
        <MDX />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return docs.generateParams()
}

export function generateMetadata({ params }: TProps) {
  const page = docs.getPage(params.slug)

  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description
  }
}
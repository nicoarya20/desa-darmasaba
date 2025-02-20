export default async function Page({ params }: { params: Promise<{ sub: string }> }) {
    const { sub } = await params
    return <div>
        {sub}
    </div>
}   
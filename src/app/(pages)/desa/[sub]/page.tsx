export default function Page({ params }: { params: { sub: string } }) {
    return <div>
        {params.sub}
    </div>
}
export default function Page({ params }: { params: { sub: string } }) {
    return (
        <div>
            <h1>{params.sub}</h1>
        </div>
    );
}   
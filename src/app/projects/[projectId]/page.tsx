

interface pageProps {
    params: Promise<{
        projectId: string
    }>
}

const page = async ({ params }: pageProps) => {
    const { projectId } = await params;
    return <div>Project ID : {projectId}</div>

}
export default page;
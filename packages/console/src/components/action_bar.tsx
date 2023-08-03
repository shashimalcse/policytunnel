function ActionBar() {
    return (
        <>
            <div className='flex flex-col'>
            <div className='mt-2 text-center font-sans text-lg font-semibold'>
                    <div className=''>Nodes</div>
                </div>
                <button className='p-4 mx-5 mt-2 text-center items-center rounded-md border border-gray-300 drop-shadow-sm bg-white font-sans text-xs'>
                    <div className=''>Conditional</div>
                </button>
            </div>
        </>
    );
}

export default ActionBar;

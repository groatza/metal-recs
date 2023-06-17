import { useEffect, useState } from "react";

function BandSection() {
    const [bandinfo, setBandInfo] = useState();

    useEffect(() => {
        const response = await fetch("/") 
    })

    return (
        <>
            <div className="flex flex-col">
                <img src="https://picsum.photos/200" alt="" />
                <h1>{bandName}</h1>
                <table>
                    <tr>
                        <td>{country}</td>
                        <td>{date}</td>
                    </tr>
                    <tr>
                        <td>{genre}</td>
                    </tr>
                </table>
            </div>
        </>
    );
}

export default BandSection;
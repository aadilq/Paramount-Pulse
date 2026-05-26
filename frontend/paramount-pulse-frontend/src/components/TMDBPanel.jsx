import { useEffect, useState } from "react";

function TMDBPanel({release}) {
    const [data, setData] = useState(null)

    useEffect(()=> {
        fetch(`https://api.paramountpulse.fyi/tmdb?title=${encodeURIComponent(release)}`)
            .then(r => r.json())
            .then(setData)
    }, [release])

    if(!data) return <h3 style={{color: "#aaa"}}>Loading...</h3>

    return(
        <div>
            {data.poster_path &&(
                <img src={`ttps://image.tmdb.org/t/p/w300${data.poster_path}`} alt={data.title} />
            )}
            <h2>{data.title}</h2>
            <p>{data.release_date}</p>
            <p>⭐ {data.rating?.toFixed(1)} ({data.vote_count?.toLocaleString()}votes)</p>
            <p>{data.overview}</p>
        </div>
    )

}
export default TMDBPanel
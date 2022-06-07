import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'


type dataType = {
    hosts: { [id: string]: { host: string, name: string, loc: { datacenter: string, city: string, country: string }, ip: string } },
    links: [{ thisid: string, otherid: string, thisip: string, otherip: string }?],
    locations: { [country: string]: { name: string, lat: number, lng: number, zoom: number, cities: { [city: string]: { name: string, lat: number, lng: number, zoom: number } } } }
};

function getServerData() {
    let data: dataType;
        data = JSON.parse(parent.document.getElementById('serverdata')?.innerHTML?.trim() ?? '{ hosts: {}, links: [], locations: {} }');
    //     try {
    // }
    // catch (error) {
    //     // data = JSON.parse('{"hosts":{"10520":{"host":"DR-MX104-P","name":"Juniper MX104 DigitalRealty","loc":{"datacenter":"","city":"AMS","country":"NL"},"ip":"172.30.1.13"},"10521":{"host":"GS-MX5-P","name":"Juniper MX5 Global Switch","loc":{"datacenter":"Global Switch","city":"BRU","country":"BE"},"ip":"89.250.176.146"},"10522":{"host":"TC-MX5-P","name":"Juniper MX5 Nikhef","loc":{"datacenter":"Nikhef","city":"EHV","country":"NL"},"ip":"89.250.176.238"}},"links":[{"thisid":"10521","otherid":"10522","thisip":"89.250.176.146","otherip":"89.250.176.238"}],"locations":{"NL":{"name":"Netherlands","lat":52.132633,"lng":5.291266,"zoom":6, "cities":{"AMS":{"name":"Amsterdam","lat":52.3702157,"lng":4.8951678,"zoom":12},"EHV":{"name":"Eindhoven","lat":51.4424,"lng":5.477,"zoom":12}}},"BE":{"name":"Belgium","lat":50.503887,"lng":4.469936,"zoom":6, "cities":{"BRU":{"name":"Brussels","lat":50.846557,"lng":4.351721,"zoom":12},"ANT":{"name":"Antwerp","lat":51.2205,"lng":4.4024,"zoom":12}}},"LU":{"name":"Luxembourg","lat":49.815273,"lng":6.129583,"zoom":6, "cities":{"LUX":{"name":"Luxembourg","lat":49.6116,"lng":6.1319,"zoom":12}}},"FR":{"name":"France","lat":46.227638,"lng":2.213749,"zoom":6, "cities":{"PAR":{"name":"Paris","lat":48.856614,"lng":2.352222,"zoom":12},"LYO":{"name":"Lyon","lat":45.764043,"lng":4.835659,"zoom":12},"TLS":{"name":"Toulouse","lat":43.604652,"lng":1.444209,"zoom":12},"BOR":{"name":"Bordeaux","lat":44.837789,"lng":-0.57918,"zoom":12},"LIL":{"name":"Lille","lat":50.637222,"lng":3.063333,"zoom":12},"NAN":{"name":"Nantes","lat":47.218371,"lng":-1.553621,"zoom":12},"MRS":{"name":"Marseille","lat":43.296482,"lng":5.36978,"zoom":12},"LIM":{"name":"Limoges","lat":45.8338,"lng":1.2679,"zoom":12}}}}}')
    //     data = { hosts: {}, links: [], locations: {} };
    // }
    // return data;
}

function getMarkers(data: dataType) {
    const markers = {} as { [key: string]: { position: [number, number], text: string } }
    // create Marker objects for all servers
    Object.keys(data.hosts).forEach((key) => {
        const host = data.hosts[key];
        const country = host.loc.country;
        const city = host.loc.city;

        const cityLat = data.locations[country]?.cities?.[city]?.lat ?? 0;
        const cityLng = data.locations[country]?.cities?.[city]?.lng ?? 0;

        markers[key] = { position: [cityLat, cityLng], text: host.name + ' (' + data.locations[country]?.cities[city]?.name + ', ' + data.locations[country]?.name + ')' }
    })
    return markers;
}

function getLinks(data: dataType) {
    const links = [] as { source: { position: [number, number] }, target: { position: [number, number] } }[];
    // create Link objects for all links
    data.links.forEach((link) => {
        link = link ?? { thisid: '', otherid: '', thisip: '', otherip: '' };
        const source = link.thisid;
        const target = link.otherid;
        const sourceLat = data.locations[data.hosts[source]?.loc.country]?.cities?.[data.hosts[source]?.loc.city]?.lat ?? 0;
        const sourceLng = data.locations[data.hosts[source]?.loc.country]?.cities?.[data.hosts[source]?.loc.city]?.lng ?? 0;
        const targetLat = data.locations[data.hosts[target]?.loc.country]?.cities?.[data.hosts[target]?.loc.city]?.lat ?? 0;
        const targetLng = data.locations[data.hosts[target]?.loc.country]?.cities?.[data.hosts[target]?.loc.city]?.lng ?? 0;
        links.push({ source: { position: [sourceLat, sourceLng] }, target: { position: [targetLat, targetLng] } })
    }
    )
    return links;
}


function map() {
    return (
        <>
            <MapContainer center={[51.505, -0.09]} zoom={6} scrollWheelZoom={true} className="map-fullscreen">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* create Marker objects for all servers */}
                {Object.keys(getMarkers(getServerData())).map((key) => {
                    const marker = getMarkers(getServerData())[key]
                    return (
                        <Marker position={marker.position} key={key}>
                            <Popup>{marker.text}, {key}</Popup>
                        </Marker>
                    )
                })}
                {/* create lines between the source and target of each link */}
                {getLinks(getServerData()).map((link) => {
                    return (
                        <Polyline positions={[link.source.position, link.target.position]} key={link.source.position.toString() + link.target.position.toString} />
                    )
                })}

            </MapContainer>
        </>
    )
}

export default map;

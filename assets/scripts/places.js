window.onload = () => {
    let method = 'dynamic';

    // if you want to statically add places, de-comment following line
    //method = 'static';

    if (method === 'static') {
        alert('static')
        let places = staticLoadPlaces();
        renderPlaces(places);
    }

    if (method !== 'static') {
        // first get current user location
        return navigator.geolocation.getCurrentPosition(function (position) {
            console.log(position);

            const coord = document.getElementById('coord');
            coord.innerText = position.coords.latitude + ' , ' +position.coords.longitude;

            // than use it to load from remote APIs some places nearby
            dynamicLoadPlaces(position.coords)
                .then((places) => {
                    renderPlaces(places);
                })
        },
            (err) => console.error('Error in retrieving position', err),
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000,
            }
        );
    }
};

function staticLoadPlaces() {
    return [
        {
            name: "Innovation Team",
            location: {
                lat: 19.4385668, // add here latitude if using static data
                lng: -99.2110767, // add here longitude if using static data
            }
        }
    ];
}

// getting places from REST APIs
function dynamicLoadPlaces(position) {
    /*
    let params = {
        radius: 1000,    // search places not farther than this value (in meters)
        clientId: 'HZIJGI4COHQ4AI45QXKCDFJWFJ1SFHYDFCCWKPIJDWHLVQVZ',   // add your credentials here
        clientSecret: 'GYRKWWJMO2WK3KIRWBXIN5FQAWXTVFIK2QM4VQWNQ4TRAKWH',   // add your credentials here
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    let corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API
    let endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=15
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })

     */
    return new Promise(resolve => {
        resolve(staticLoadPlaces())
    });
};

function renderPlaces(places) {
    let scene = document.querySelector('a-scene');

    console.log('PLACES ', places);

    places.forEach((place) => {
        const latitude = place.location.lat;
        const longitude = place.location.lng;

        // add place icon
        const icon = document.createElement('a-image');
        icon.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude}`);
        icon.setAttribute('name', place.name);
        icon.setAttribute('src', 'https://yaotzin68.github.io/gps-ar/assets/img/map-marker.png');

        // for debug purposes, just show in a bigger scale, otherwise I have to personally go on places...
        icon.setAttribute('scale', '20, 20');

        icon.addEventListener('loaded', () => window.dispatchEvent(new CustomEvent('gps-entity-place-loaded')));

        const clickListener = function (ev) {
            ev.stopPropagation();
            ev.preventDefault();

            const name = ev.target.getAttribute('name');

            const el = ev.detail.intersection && ev.detail.intersection.object.el;

            if (el && el === ev.target) {
                const label = document.createElement('span');
                const container = document.createElement('div');
                container.setAttribute('id', 'place-label');
                label.innerText = name + `lat: ${latitude} long: ${longitude}`;
                //label.innerText = name;
                container.appendChild(label);
                document.body.appendChild(container);

                setTimeout(() => {
                    container.parentElement.removeChild(container);
                }, 1500);
            }
        };

        icon.addEventListener('click', clickListener);

        scene.appendChild(icon);
    });
}

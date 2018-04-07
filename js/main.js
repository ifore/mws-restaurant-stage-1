let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []


if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */


window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false

  });

  google.maps.event.addListener(map, "tilesloaded", function(){
    [].slice.apply(document.querySelectorAll('#map a')).forEach(function(item) {
        item.setAttribute('tabindex','-1');
    });
  })


  updateRestaurants();
}



/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');
  nSelect.setAttribute('aria-label', 'drop-down list');
  cSelect.setAttribute('aria-label', 'drop-down list');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/1.jpg')
    image.alt = restaurant.name + ' Restaurant, classical indoor decoration';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/2.jpg')
      image.alt = restaurant.name + ' Restaurant, pizza on a plate';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/3.jpg')
      image.alt = restaurant.name + ' Restaurant, modern indoor wood decoration';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/4.jpg')
      image.alt = restaurant.name + ' Restaurant, usual outdoor neon decoration';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/5.jpg')
      image.alt = restaurant.name + ' Restaurant, crowded, industrial interior';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/6.jpg')
      image.alt = restaurant.name + ' Restaurant, spacious, american interior design';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/7.jpg')
      image.alt = restaurant.name + ' Restaurant, small premise, unordinary exterior';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/8.jpg')
      image.alt = restaurant.name + ' Restaurant, classical outdoor decoration';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/9.jpg')
      image.alt = restaurant.name + ' Restaurant, asian dinnerwear';
  if(DBHelper.imageUrlForRestaurant(restaurant) === '/img/10.jpg')
      image.alt = restaurant.name + ' Restaurant, minimalist interior design';

  li.append(image);
  const div = document.createElement('div');
  div.classList.add("restaurant-info");
  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  div.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  div.append(address);
  li.append(div);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'Open restaurant page');
  li.append(more);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

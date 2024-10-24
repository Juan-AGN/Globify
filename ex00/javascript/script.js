const clientID = '06e111fc44f745d981f0d40b7cd6362b';
const redirectURI = 'https://globify-qh8k.vercel.app'; // Correct path
let token = localStorage.getItem('spotifyToken');

// 1. Function to redirect user to Spotify authentication page
function authenticateSpotify() {
  const url = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&redirect_uri=${redirectURI}&scope=user-read-private user-read-email playlist-read-private user-library-read`;
  window.location.href = url;
}

// 2. Function to check if there's a token in the URL hash
function getTokenFromUrl() {
  const hash = window.location.hash.substring(1); // Extract the part after the '#'
  const params = new URLSearchParams(hash);
  return params.get('access_token');
}

// 3. Function to handle redirect after successful authentication
function handleRedirect() {
  token = getTokenFromUrl();
  if (token) {
    // Guardar token en localStorage
    localStorage.setItem('spotifyToken', token);
    window.location.hash = ''; // Limpiar la URL para que no se vea el token

    console.log("Token obtenido y almacenado:", token); // Debug: Verificar token

    // Cargar la información del usuario
    displayUserProfile();
    loadPlaylists();
  } else {
    console.log("No se encontró el token en la URL.");
  }
}


// 4. Function to log out the user
function logout() {
  localStorage.removeItem('spotifyToken');
  token = null;
  document.getElementById('loginBtn').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'none';
  document.getElementById('profile-section').innerHTML = '';
}

// 5. Function to display the user's profile
async function displayUserProfile() {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Error al obtener perfil del usuario');
    }

    const userData = await response.json();
    console.log("Datos del usuario:", userData); // Debug: Verificar los datos del perfil

    const profileSection = document.getElementById('profile-section');
    profileSection.innerHTML = `
      <h2>Bienvenido, ${userData.display_name}</h2>
      <div>
      
      <img src="${userData.images[0]?.url}" alt="Foto de perfil" width="100">
      </div>
      </div>
    `;
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
  }
}

// 6. Function to load the user's playlists
async function loadPlaylists() {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=10', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Error al obtener las listas de reproducción');
    }

    const playlists = await response.json();
    console.log("Listas de reproducción:", playlists); // Debug: Verificar las listas de reproducción

    const playlistSection = document.getElementById('playlist-section');
    playlistSection.innerHTML = ``;

    playlists.items.forEach((playlist, index) => {
      const playlistDiv = document.createElement('div');
      playlistDiv.innerHTML = `
        <img src="${playlist.images[0]?.url}" width="100">
        <h4>${index + 1} | ${playlist.name}</h4>
      `;
      playlistSection.appendChild(playlistDiv);
    });
  } catch (error) {
    console.error("Error al cargar las listas de reproducción:", error);
  }
}


// Event Listeners
document.getElementById('loginBtn').addEventListener('click', authenticateSpotify);
document.getElementById('logoutBtn').addEventListener('click', logout);

// Handle token and load data on page load
window.addEventListener('load', () => {
  if (window.location.hash) {
    handleRedirect();
  } else if (token) {
    displayUserProfile();
    loadPlaylists();
  }
});

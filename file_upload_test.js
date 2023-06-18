const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');

uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();
   console.log("hellllllllllllloooooo");  
  const formData = new FormData();
  formData.append('image', imageInput.files[0]);

   axios.post('http://127.0.0.1:3000/TEST/UPLOAD', formData)
    .then(response => {
      console.log('Image uploaded successfully:', response.data);
      // Handle the response from the server as needed
    })
    .catch(error => {
      console.error('Error:', error);
      // Handle any error that occurred during the upload
    });
});

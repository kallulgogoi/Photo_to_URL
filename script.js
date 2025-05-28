// Cloudinary configuration
        const cloudName = 'dgechlqls';
        const uploadPreset = 'Kallul gogoi';

        // DOM elements
        const dropArea = document.getElementById('dropArea');
        const fileInput = document.getElementById('fileInput');
        const previewContainer = document.getElementById('previewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const loaderContainer = document.getElementById('loaderContainer');
        const resultWrapper = document.getElementById('resultWrapper');
        const resultContainer = document.getElementById('resultContainer');
        const imageUrl = document.getElementById('imageUrl');
        const copyBtn = document.getElementById('copyBtn');
        const dimensions = document.getElementById('dimensions');
        const fileSize = document.getElementById('fileSize');
        const fileFormat = document.getElementById('fileFormat');
        const uploadTime = document.getElementById('uploadTime');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        const privacyLink = document.getElementById('privacyLink');
        const termsLink = document.getElementById('termsLink');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        dropArea.addEventListener('drop', handleDrop, false);

        // Handle file selection via input
        fileInput.addEventListener('change', handleFiles, false);

        // Copy URL button
        copyBtn.addEventListener('click', copyToClipboard);

        // Footer links
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('No Privacy policy.');
        });

        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('No Terms of service.');
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight() {
            dropArea.classList.add('highlight');
        }

        function unhighlight() {
            dropArea.classList.remove('highlight');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles({ target: { files } });
        }

        function handleFiles(e) {
            const files = e.target.files;
            if (files.length) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    if (file.size > 10 * 1024 * 1024) {
                        showError('File size exceeds 10MB limit');
                        return;
                    }
                    displayImagePreview(file);
                    uploadImage(file);
                } else {
                    showError('Please select an image file (JPEG, PNG, GIF)');
                }
            }
        }

        function displayImagePreview(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }

        function uploadImage(file) {
            // Show loader and progress bar
            loaderContainer.classList.remove('hidden');
            progressContainer.classList.remove('hidden');
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);
            
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true);
            
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                }
            };
            
            xhr.onload = function() {
                // Hide loader when upload is complete
                loaderContainer.classList.add('hidden');
                
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    showResult(response);
                } else {
                    const response = JSON.parse(xhr.responseText);
                    showError(response.error.message || 'Upload failed. Please try again.');
                }
            };
            
            xhr.onerror = function() {
                loaderContainer.classList.add('hidden');
                showError('Network error occurred. Please check your connection.');
            };
            
            xhr.send(formData);
        }

        function showResult(response) {
            // Hide progress bar
            progressContainer.classList.add('hidden');
            
            // Display the result
            imageUrl.value = response.secure_url;
            resultWrapper.classList.remove('hidden');
            
            // Display image info
            dimensions.textContent = `${response.width} × ${response.height}`;
            fileSize.textContent = formatFileSize(response.bytes);
            fileFormat.textContent = response.format.toUpperCase();
            
            // Add upload time
            const now = new Date();
            uploadTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' }) + ' • ' + now.toLocaleDateString();
            
            // Scroll to result
            resultWrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function showError(message) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
            
            setTimeout(() => {
                errorMessage.classList.add('hidden');
            }, 5000);
        }

        function copyToClipboard() {
            imageUrl.select();
            document.execCommand('copy');
            
            // Change button text temporarily
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]);
        }
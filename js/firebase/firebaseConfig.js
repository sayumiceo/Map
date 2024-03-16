  // Import the functions you need from the SDKs you need
  import { firebaseConfig } from '../key.js'; 

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
  import { getDatabase, ref, push, set, onValue }  
  from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


let currentPage = 1;
const jobsPerPage = 9; // Adjust the number of jobs per page as needed
let totalJobs = [];


// Function to display job information in the list
function addJobToList(jobData, jobListing) {
    // Create the card element
    const card = document.createElement('div');
    card.className = 'card';

    // Create and append the job title element
    const jobTitleElement = document.createElement('div');
    jobTitleElement.className = 'job-title';
    jobTitleElement.textContent = jobData.title;
    card.appendChild(jobTitleElement);

    // Create and append the job description element
    const jobDescriptionElement = document.createElement('div');
    jobDescriptionElement.className = 'job-description';
    jobDescriptionElement.textContent = jobData.description;
    card.appendChild(jobDescriptionElement);

    // Create and append the job location element
    const jobLocationElement = document.createElement('div');
    jobLocationElement.className = 'job-location';
    jobLocationElement.textContent = jobData.location;
    card.appendChild(jobLocationElement);

    // Append the card to the job listing section
    jobListing.appendChild(card);

    const event = new CustomEvent('NewJobAdded', { detail: jobData });
    document.dispatchEvent(event);
}

// Function to fetch jobs from Firebase and update the UI
// function fetchJobsAndUpdateList(jobListing) {
//     const jobsRef = ref(db, 'jobs');
//     onValue(jobsRef, (snapshot) => {
//         // Clear the current list
//         jobListing.innerHTML = '';

//         // Get the data from Firebase
//         const jobs = snapshot.val();

//         // Loop through the jobs and add them to the list
//         for (const jobId in jobs) {
//             addJobToList(jobs[jobId], jobListing);
//         }
//     }, {
//         onlyOnce: false 
//         // This ensures the listener stays active
//     });
// }


function fetchJobsAndUpdateList(jobListing) {
    const jobsRef = ref(db, 'jobs');
    onValue(jobsRef, (snapshot) => {
        totalJobs = []; // Reset the total jobs array
        
        // Get the data from Firebase
        const jobs = snapshot.val();

        // Convert the jobs object to an array and store in totalJobs
        for (const jobId in jobs) {
            totalJobs.push(jobs[jobId]);
        }
        
        // Render the first page of jobs
        renderPage(currentPage, jobListing);
    }, {
        onlyOnce: false // This ensures the listener stays active
    });
}

function renderPage(pageNumber, jobListing) {
    // Calculate the index range of jobs for the current page
    const startIndex = (pageNumber - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    
    // Clear the current job listing
    jobListing.innerHTML = '';
    
    // Slice the totalJobs array to get the jobs for the current page and render them
    totalJobs.slice(startIndex, endIndex).forEach(jobData => {
        addJobToList(jobData, jobListing);
    });

    // Update pagination controls here if needed
    updatePaginationControls();
}

function updatePaginationControls() {
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = ''; // Clear existing controls
    
    const totalPages = Math.ceil(totalJobs.length / jobsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderPage(i, document.getElementById('job-listing'));
        });
        
        paginationContainer.appendChild(pageButton);
    }
}   


document.addEventListener('DOMContentLoaded', function() {
    const jobListing = document.getElementById('job-listing'); // The ID of the listing section
    fetchJobsAndUpdateList(jobListing);

    const postJobButton = document.getElementById('post-job-button');
    const jobFormPopup = document.getElementById('job-form-popup');
    const jobForm = document.getElementById('job-form');

 
    const closeButton = document.getElementById('close-popup');
    const popup = document.getElementById('job-form-popup');

    closeButton.addEventListener('click', function() {
        jobFormPopup.classList.toggle('popup-active');
    });


    // Ensure the elements exist before adding event listeners
    if (postJobButton && jobFormPopup) {
        // Display the popup when the post button is clicked
        postJobButton.addEventListener('click', () => {
            jobFormPopup.classList.toggle('popup-active');
        });
    }

    if (jobForm) {
        // Handle form submission event
        jobForm.addEventListener('submit', (e) => {
            e.preventDefault();
    
            // Retrieve information from the form
            const jobTitle = document.getElementById('job-title').value;
            const jobDescription = document.getElementById('job-description').value;
            const jobLocation = document.getElementById('job-location').value;
    
            // Define the jobData object at this location
            const jobData = {
                title: jobTitle,
                description: jobDescription,
                location: jobLocation
            };
    
            // Send data to Firebase only, do not update the UI here
            saveJobToFirebase(jobData);
    
            // Hide the popup
            jobFormPopup.classList.remove('popup-active');
        });
    }

});


// Function to save data to Firebase
function saveJobToFirebase(jobData) {
    const jobsRef = ref(db, 'jobs');
    const newJobRef = push(jobsRef);
    set(newJobRef, jobData)
        .then(() => {
            console.log('Data saved successfully.');
            // Call the function to pin the job location on the map
            
            //pinJobLocationOnMap(jobData.location, jobData.title, jobData.description);
        })
        .catch((error) => {
            console.error('Data could not be saved. ' + error);
        });
}




export { saveJobToFirebase, addJobToList };

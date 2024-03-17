  // Import the functions you need from the SDKs you need
  import { firebaseConfig } from '../key.js'; 

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
  import { getDatabase, ref, push, set, onValue }  
  from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


let currentPage = 1;
const jobsPerPage = 9; 
let totalJobs = [];


// 保存
function addJobToList(jobData, jobListing) {
    // Create the card element
    const card = document.createElement('div');
    card.className = 'card';

    // Create and append the job title element
    const jobTitleElement = document.createElement('div');
    jobTitleElement.className = 'job-title';
    jobTitleElement.textContent = jobData.title;
    card.appendChild(jobTitleElement); //要素をカードに追加

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

// Firebaseから仕事情報を取得してリストに表示
function fetchJobsAndUpdateList(jobListing) {
    const jobsRef = ref(db, 'jobs');
    onValue(jobsRef, (snapshot) => {
        totalJobs = []; // Reset the total jobs array
        
        // Get the data from Firebase
        const jobs = snapshot.val();

        // Convert the jobs object to an array and store in totalJobs
        for (const jobId in jobs) {
            totalJobs.push(jobs[jobId]); //データの処理と配列への格納
        }
        
        renderPage(currentPage, jobListing); // ページ上のリストの更新
        updatePaginationControls(); // Update the pagination controls
    }, {
        onlyOnce: false // This ensures the listener stays active
    });
}

//指定されたページ番号に基づいて仕事のリストを表示
function renderPage(pageNumber, jobListing) {
    // Calculate the index range of jobs for the current page
    const startIndex = (pageNumber - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    
    // Clear the current job listing
    jobListing.innerHTML = '';
    
    const visibleJobs = totalJobs.slice(startIndex, endIndex);
    visibleJobs.forEach(jobData => addJobToList(jobData, jobListing)); // Render the jobs for the current page

    updatePaginationControls(); // Call to update the pagination buttons

    const event = new CustomEvent('ClearJobs', { });
    document.dispatchEvent(event);

    const contentContainer = document.getElementById('listing-container');

    contentContainer.scrollTo(0, 0);
    window.scrollTo(0, 0);


}

//ページネーションコントロール
function updatePaginationControls() {
    const paginationContainer = document.getElementById('pagination-controls');
    paginationContainer.innerHTML = ''; // Clear existing controls
    
    const totalPages = Math.ceil(totalJobs.length / jobsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = currentPage === i ? 'active-page' : 'page-number'; // Highlight the current page
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderPage(i, document.getElementById('job-listing'));
        });
        paginationContainer.appendChild(pageButton);
    }
}   

//ページが読み込まれた後に初期化
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
            if (jobTitle != "" && jobDescription != "" && jobLocation != "") {
                saveJobToFirebase(jobData);
                jobFormPopup.classList.remove('popup-active');
            } else {
              alert("入力漏れがあります。");
            }

            
        });
    }

});


// 新しい仕事のデータをFirebaseに保存
function saveJobToFirebase(jobData) {
    const jobsRef = ref(db, 'jobs');
    const newJobRef = push(jobsRef);
    set(newJobRef, jobData)
        .then(() => {
            console.log('Data saved successfully.');

        })
        .catch((error) => {
            console.error('Data could not be saved. ' + error);
        });
}




export { saveJobToFirebase, addJobToList };

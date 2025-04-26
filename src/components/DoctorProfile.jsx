import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DoctorProfile.css';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        
        const response = await fetch('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
        const data = await response.json();
        const doctorData = data.find(d => d.id === id);
        if (doctorData) {
          // Transform the data to ensure consistent format
          const transformedDoctor = {
            ...doctorData,
            name: doctorData.name || '',
            specialties: Array.isArray(doctorData.specialities)
              ? doctorData.specialities.map(s => (typeof s === 'object' ? s.name : s)).filter(Boolean)
              : [],
            experience: doctorData.experience || '',
            fee: doctorData.fees || '',
            consultationType: {
              video: doctorData.video_consult || false,
              clinic: doctorData.in_clinic || false
            },
            image: doctorData.photo || '',
            description: doctorData.description || 'No description available',
            education: doctorData.education || 'Information not available',
            languages: doctorData.languages || ['English'],
            location: doctorData.location || 'Location not specified',
            rating: doctorData.rating || '4.0',
            reviews: doctorData.reviews || []
          };
          setDoctor(transformedDoctor);
        }
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading doctor details...</div>;
  }

  if (!doctor) {
    return <div className="error">Doctor not found</div>;
  }

  return (
    <div className="doctor-profile">
      <button 
        className="back-button"
        onClick={() => navigate(-1)}
        data-testid="back-button"
      >
        ← Back to Doctors List
      </button>

      <div className="profile-header">
        <img src={doctor.image} alt={doctor.name} className="profile-image" />
        <div className="profile-info">
          <h1 data-testid="doctor-name">{doctor.name}</h1>
          <p className="specialties" data-testid="doctor-specialties">
            {doctor.specialties.join(', ')}
          </p>
          <p className="experience" data-testid="doctor-experience">
            {doctor.experience}
          </p>
          <div className="rating" data-testid="doctor-rating">
            ⭐ {doctor.rating}
          </div>
        </div>
      </div>

      <div className="consultation-options">
        <h2>Consultation Options</h2>
        <div className="options-grid">
          {doctor.consultationType.video && (
            <div className="option-card">
              <h3>Video Consultation</h3>
              <p className="fee">₹{doctor.fee}</p>
            </div>
          )}
          {doctor.consultationType.clinic && (
            <div className="option-card">
              <h3>In-Clinic Consultation</h3>
              <p className="fee">₹{doctor.fee}</p>
              <p className="location">{doctor.location}</p>
            </div>
          )}
        </div>
      </div>

      <div className="profile-details">
        <section>
          <h2>About</h2>
          <p>{doctor.description}</p>
        </section>

        <section>
          <h2>Education</h2>
          <p>{doctor.education}</p>
        </section>

        <section>
          <h2>Languages Spoken</h2>
          <p>{doctor.languages.join(', ')}</p>
        </section>

        {doctor.reviews.length > 0 && (
          <section>
            <h2>Patient Reviews</h2>
            <div className="reviews">
              {doctor.reviews.map((review, index) => (
                <div key={index} className="review">
                  <div className="review-rating">⭐ {review.rating}</div>
                  <p>{review.comment}</p>
                  <p className="reviewer">- {review.patient}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile; 
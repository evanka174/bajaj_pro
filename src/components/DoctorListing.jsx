import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DoctorListing.css';

const DoctorListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch doctors data
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json');
        console.log('Raw API Response:', response.data);
        
        if (response.data) {
          const transformedData = response.data.map(doctor => {
            // Extract numeric experience value
            const experienceMatch = doctor.experience?.match(/\d+/);
            const experienceYears = experienceMatch ? parseInt(experienceMatch[0]) : 0;

            // Extract numeric fee value
            const feeMatch = doctor.fees?.match(/\d+/);
            const feeAmount = feeMatch ? parseInt(feeMatch[0]) : 0;

            return {
              ...doctor,
              name: doctor.name || '',
              specialties: Array.isArray(doctor.specialities) 
                ? doctor.specialities.map(s => (typeof s === 'object' ? s.name : s)).filter(Boolean)
                : [],
              experience: experienceYears,
              fee: feeAmount,
              consultationType: {
                video: doctor.video_consult || false,
                clinic: doctor.in_clinic || false
              },
              image: doctor.photo || ''
            };
          });
          
          console.log('Transformed data:', transformedData);
          setDoctors(transformedData);
          setFilteredDoctors(transformedData);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to fetch doctors data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Load filters from URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setSearchTerm(params.search || '');
    setSelectedConsultation(params.consultation || '');
    setSelectedSpecialties(params.specialties ? params.specialties.split(',') : []);
    setSortBy(params.sort || '');
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    if (!doctors.length) return;

    console.log('Current filters:', {
      searchTerm,
      selectedConsultation,
      selectedSpecialties,
      sortBy
    });

    let filtered = [...doctors];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply consultation type filter
    if (selectedConsultation) {
      filtered = filtered.filter(doctor => {
        if (selectedConsultation === 'video') return doctor.consultationType.video;
        if (selectedConsultation === 'clinic') return doctor.consultationType.clinic;
        return true;
      });
    }

    // Apply specialties filter
    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter(doctor => {
        const doctorSpecialties = doctor.specialties.map(s => s.toLowerCase());
        return selectedSpecialties.some(selected => 
          doctorSpecialties.includes(selected.toLowerCase())
        );
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        if (sortBy === 'fees') {
          return a.fee - b.fee;
        }
        if (sortBy === 'experience') {
          return b.experience - a.experience;
        }
        return 0;
      });
    }

    console.log('Filtered doctors:', filtered);
    setFilteredDoctors(filtered);

    // Update URL params
    const newParams = {};
    if (searchTerm) newParams.search = searchTerm;
    if (selectedConsultation) newParams.consultation = selectedConsultation;
    if (selectedSpecialties.length) newParams.specialties = selectedSpecialties.join(',');
    if (sortBy) newParams.sort = sortBy;
    setSearchParams(newParams, { replace: true });
  }, [searchTerm, selectedConsultation, selectedSpecialties, sortBy, doctors, setSearchParams]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value && doctors.length) {
      const matches = doctors
        .filter(doctor => 
          doctor.name.toLowerCase().includes(value.toLowerCase()) ||
          doctor.specialties.some(specialty => 
            specialty.toLowerCase().includes(value.toLowerCase())
          )
        )
        .slice(0, 3);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  };

  const handleSpecialtyChange = (specialty) => {
    console.log('Toggling specialty:', specialty);
    setSelectedSpecialties(prev => {
      const newSpecialties = prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty];
      console.log('New selected specialties:', newSpecialties);
      return newSpecialties;
    });
  };

  const handleConsultationChange = (type) => {
    setSelectedConsultation(prev => prev === type ? '' : type);
  };

  const handleSortChange = (type) => {
    setSortBy(prev => prev === type ? '' : type);
  };

  const handleDoctorClick = (doctorId) => {
    navigate(`/doctor/${doctorId}`);
  };

  const specialties = [
    'General Physician', 'Dentist', 'Dermatologist', 'Paediatrician',
    'Gynaecologist', 'ENT', 'Diabetologist', 'Cardiologist',
    'Physiotherapist', 'Endocrinologist', 'Orthopaedic', 'Ophthalmologist',
    'Gastroenterologist', 'Pulmonologist', 'Psychiatrist', 'Urologist',
    'Dietitian-Nutritionist', 'Psychologist', 'Sexologist', 'Nephrologist',
    'Neurologist', 'Oncologist', 'Ayurveda', 'Homeopath'
  ];

  if (isLoading) {
    return <div className="loading">Loading doctors...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="doctor-listing">
      <div className="search-bar">
        <input
          type="text"
          data-testid="autocomplete-input"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search Symptoms, Doctors, Specialists, Clinics"
        />
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((doctor, index) => (
              <div
                key={index}
                data-testid="suggestion-item"
                className="suggestion-item"
                onClick={() => {
                  setSearchTerm(doctor.name);
                  setSuggestions([]);
                }}
              >
                {doctor.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="content">
        <div className="filters">
          <div className="filter-section">
            <h3 data-testid="filter-header-sort">Sort by</h3>
            <div>
              <label>
                <input
                  type="radio"
                  name="sort"
                  data-testid="sort-fees"
                  checked={sortBy === 'fees'}
                  onChange={() => handleSortChange('fees')}
                />
                Price: Low-High
              </label>
              <label>
                <input
                  type="radio"
                  name="sort"
                  data-testid="sort-experience"
                  checked={sortBy === 'experience'}
                  onChange={() => handleSortChange('experience')}
                />
                Experience: Most Experience first
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3 data-testid="filter-header-moc">Mode of consultation</h3>
            <div>
              <label>
                <input
                  type="radio"
                  name="consultation"
                  data-testid="filter-video-consult"
                  checked={selectedConsultation === 'video'}
                  onChange={() => handleConsultationChange('video')}
                />
                Video Consultation
              </label>
              <label>
                <input
                  type="radio"
                  name="consultation"
                  data-testid="filter-in-clinic"
                  checked={selectedConsultation === 'clinic'}
                  onChange={() => handleConsultationChange('clinic')}
                />
                In-Clinic
              </label>
            </div>
          </div>

          <div className="filter-section">
            <h3 data-testid="filter-header-specialties">Specialties</h3>
            <div className="specialties-list">
              {specialties.map((specialty, index) => (
                <label key={index}>
                  <input
                    type="checkbox"
                    data-testid={`filter-specialty-${specialty.toLowerCase().replace(/\s+/g, '-')}`}
                    checked={selectedSpecialties.includes(specialty)}
                    onChange={() => handleSpecialtyChange(specialty)}
                  />
                  {specialty}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="doctors-list">
          {filteredDoctors.map((doctor, index) => (
            <div 
              key={index} 
              className="doctor-card" 
              data-testid="doctor-card"
              onClick={() => handleDoctorClick(doctor.id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={doctor.image} alt={doctor.name} className="doctor-image" />
              <div className="doctor-info">
                <h2>{doctor.name}</h2>
                <p>{doctor.specialties.join(', ')}</p>
                <p>{doctor.experience} years experience</p>
                <p>₹{doctor.fee}</p>
                <div className="consultation-types">
                  {doctor.consultationType.video && <span>Video Consultation</span>}
                  {doctor.consultationType.clinic && <span>In-Clinic</span>}
                </div>
              </div>
            </div>
          ))}
          {filteredDoctors.length === 0 && (
            <div className="no-results">No doctors found matching your criteria</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorListing; 
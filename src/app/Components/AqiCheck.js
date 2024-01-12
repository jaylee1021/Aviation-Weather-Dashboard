import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Image from 'next/image';
import '../css/weather.css';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '100%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function AqiCheck({ aqiData }) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const aqiCheck = () => {
        const currentAqi = aqiData.current.us_aqi;
        switch (true) {
            case currentAqi >= 0 && currentAqi <= 50:
                return (
                    <div className='aqi_box_style aqi_good'>
                        <h3 className='aqi_style'>Air Quality Good!</h3>
                        <p className='aqi_style'>AQI: {currentAqi}</p>
                    </div>);
            case currentAqi > 50 && currentAqi <= 100:
                return (
                    <div className='aqi_box_style aqi_moderate'>
                        <h3 className='aqi_style'>Air Quality Moderate!</h3>
                        <p className='aqi_style'>AQI: {currentAqi}</p>
                    </div>
                );
            case currentAqi > 100 && currentAqi <= 150:
                return (
                    <div className='aqi_box_style aqi_unhealthy_sensitive'>
                        <h3 className='aqi_style'>Air Quality Unhealthy <br />for Sensitive Groups!</h3>
                        <p className='aqi_style'>AQI: {currentAqi}</p>
                    </div>
                );
            case currentAqi > 150 && currentAqi <= 200:
                return (
                    <div className='aqi_box_style aqi_unhealthy'>
                        <h3 className='aqi_style'>Air Quality Unhealthy!</h3>
                        <p className='aqi_style'>AQI: {currentAqi}</p>
                    </div>
                );
            case currentAqi > 200 && currentAqi <= 300:
                return (
                    <div className='aqi_box_style aqi_very_unhealthy'>
                        <h3 className='aqi_style'>Air Quality Very Unhealthy!</h3>
                        <p className='aqi_style'>AQI: {currentAqi}</p>
                    </div>
                );
            case currentAqi > 300:
                return (
                    <div className='aqi_box_style aqi_hazardous'>
                        <h3 className='aqi_style'>Air Quality Hazardous!</h3>
                        <p className='aqi_style'>AQI: {currentAqi}</p>
                    </div>
                );
        }
    };

    if (!aqiData) {
        return (
            <div>
                Loading...
            </div>
        );
    }
    return (
        <div>
            <div style={{ cursor: 'pointer' }} onClick={handleOpen}>
                {aqiCheck()}
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Fade in={open}>
                    <Box sx={style}>
                        <Typography id="transition-modal-title" variant="h6" component="h2" style={{ overflow: 'auto' }}>
                            <Image width={1000} height={500} src={'/aqi_chart.png'} onClick={handleClose} alt="..." />
                        </Typography>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
}
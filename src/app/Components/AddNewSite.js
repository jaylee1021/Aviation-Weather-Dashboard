import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import '../css/weather.css';
import { useState } from 'react';
import axios from 'axios';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function AddNewLocation({ userId, fetchSites }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [state, setState] = useState({
        siteName: '',
        siteLatitude: '',
        siteLongitude: ''
    });
    const handleSubmit = async (e) => {
        e.preventDefault();

        await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/sites/newSite`, {
            siteName: state.siteName, siteLatitude: state.siteLatitude, siteLongitude: state.siteLongitude, userId
        })
            .then((res) => {
                fetchSites();
                handleClose();
                setState({
                    ...state, siteName: '', siteLatitude: '', siteLongitude: ''
                });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleChange = (e) => {
        setState({ ...state, [e.target.name]: e.target.value });
    };

    return (
        <div className='side_bar'>
            <Button style={{ margin: '10px' }} variant='outlined' onClick={handleOpen}>Add a new Location</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        <div className="table_border">
                            <div style={{ padding: '10px' }}>
                                <h3 style={{ color: 'black' }}>Add New Location</h3>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                                    <TextField id="siteName" label="Location Name" variant="standard" value={state.siteName} onChange={handleChange} name='siteName' required />
                                    <TextField id="siteLatitude" label="Latitude" variant="standard" value={state.siteLatitude} onChange={handleChange} name='siteLatitude' required />
                                    <TextField id="siteLongitude" label="Longitude" variant="standard" value={state.siteLongitude} onChange={handleChange} name='siteLongitude' required />
                                    <Button variant='outlined' type="submit" style={{ margin: '10px 0' }} className="button_style">submit</Button>
                                </form>
                            </div>
                        </div>
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}
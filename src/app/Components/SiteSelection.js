
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function SiteSelection({ fetchData, userId }) {

    const site = typeof window !== 'undefined' && localStorage.getItem('selectSite') ? localStorage.getItem('selectSite') : '65a21922fc889f2bcd323d66';

    const handleSiteSelection = async (e) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectSite', e.target.value);
        }

        try {
            await fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const [sites, setSites] = useState([]); // [
    // const fetchSite = async () => {
    useEffect(() => async () => {
        await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/sites/user/${userId}`)
            .then((response) => {
                console.log('sites', response.data.sites);
                setSites(response.data.sites);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [userId]);

    return (
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} style={{ margin: '10px 10px 10px 0' }}>
            <InputLabel id="site_select_label">Site</InputLabel>
            <Select
                labelId="site_select"
                id="site_select_menu"
                value={site}
                onChange={handleSiteSelection}
                label="Select_site"
                name='selectSite'
            >
                {sites.map((site) => (
                    <MenuItem key={site._id} value={site._id}>{site.siteName}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
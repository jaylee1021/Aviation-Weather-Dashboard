
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function SiteSelection({ fetchSingleSite, fetchData, userId }) {

    const [sites, setSites] = useState([]); // [
    const defaultValue = sites.find(site => site._id === localStorage.getItem('selectSite')) ? localStorage.getItem('selectSite') : '';

    const handleSiteSelection = async (e) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectSite', e.target.value);
        }

        try {
            await fetchSingleSite();
            await fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/sites/user/${userId}`);
                console.log('siteSelection error');
                setSites(response.data.sites);
            } catch (error) {
                console.error('Error fetching sites:', error);
            }
        };

        fetchSites();
    }, [userId]);

    return (
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }} style={{ margin: '10px 10px 10px 0' }}>
            <InputLabel id="site_select_label">Site</InputLabel>
            <Select
                labelId="site_select"
                id="site_select_menu"
                value={defaultValue}
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
import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Rating,
    Box,
    IconButton,
    Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import learningPlanService from '../../services/learningPlanService';

const LearningPlans = () => {
    const [learningPlans, setLearningPlans] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        topics: [],
        resources: [],
        expectedCompletionDate: '',
        isPublic: false
    });

    useEffect(() => {
        loadLearningPlans();
    }, []);

    const loadLearningPlans = async () => {
        try {
            const data = await learningPlanService.getAllLearningPlans();
            setLearningPlans(data);
        } catch (error) {
            console.error('Error loading learning plans:', error);
        }
    };

    const handleOpen = (plan = null) => {
        if (plan) {
            setSelectedPlan(plan);
            setFormData({
                title: plan.title,
                description: plan.description,
                topics: plan.topics,
                resources: plan.resources,
                expectedCompletionDate: plan.expectedCompletionDate,
                isPublic: plan.isPublic
            });
        } else {
            setSelectedPlan(null);
            setFormData({
                title: '',
                description: '',
                topics: [],
                resources: [],
                expectedCompletionDate: '',
                isPublic: false
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedPlan(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedData = {
                ...formData,
                topics: formData.topics.filter(topic => topic.trim() !== ''),
                resources: formData.resources.filter(resource => resource.trim() !== ''),
                expectedCompletionDate: formData.expectedCompletionDate || null,
                isPublic: formData.isPublic || false
            };

            if (selectedPlan) {
                await learningPlanService.updateLearningPlan(selectedPlan.id, formattedData);
            } else {
                await learningPlanService.createLearningPlan(formattedData);
            }
            handleClose();
            loadLearningPlans();
        } catch (error) {
            console.error('Error saving learning plan:', error);
            alert('Error saving learning plan. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this learning plan?')) {
            try {
                await learningPlanService.deleteLearningPlan(id);
                loadLearningPlans();
            } catch (error) {
                console.error('Error deleting learning plan:', error);
            }
        }
    };

    const handleRate = async (id, rating) => {
        try {
            await learningPlanService.rateLearningPlan(id, rating);
            loadLearningPlans();
        } catch (error) {
            console.error('Error rating learning plan:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const results = await learningPlanService.searchLearningPlans(searchQuery);
            setLearningPlans(results);
        } catch (error) {
            console.error('Error searching learning plans:', error);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Learning Plans
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Create New Plan
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    label="Search Learning Plans"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
            </Box>

            <Grid container spacing={3}>
                {learningPlans.map((plan) => (
                    <Grid item xs={12} md={6} lg={4} key={plan.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="h2">
                                    {plan.title}
                                </Typography>
                                <Typography color="textSecondary" gutterBottom>
                                    {plan.description}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    {plan.topics.map((topic, index) => (
                                        <Chip
                                            key={index}
                                            label={topic}
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Rating
                                        value={plan.rating || 0}
                                        onChange={(event, newValue) => {
                                            handleRate(plan.id, newValue);
                                        }}
                                    />
                                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                                        ({plan.totalRatings || 0} ratings)
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <IconButton onClick={() => handleOpen(plan)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(plan.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedPlan ? 'Edit Learning Plan' : 'Create Learning Plan'}
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={4}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Topics (comma-separated)"
                            value={formData.topics.join(', ')}
                            onChange={(e) => setFormData({
                                ...formData,
                                topics: e.target.value.split(',').map(topic => topic.trim())
                            })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Resources (comma-separated)"
                            value={formData.resources.join(', ')}
                            onChange={(e) => setFormData({
                                ...formData,
                                resources: e.target.value.split(',').map(resource => resource.trim())
                            })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Expected Completion Date"
                            type="datetime-local"
                            value={formData.expectedCompletionDate}
                            onChange={(e) => setFormData({
                                ...formData,
                                expectedCompletionDate: e.target.value
                            })}
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedPlan ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LearningPlans; 
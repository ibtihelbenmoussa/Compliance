import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { RiskConfiguration, RiskImpact, RiskProbability, RiskCriteria, CriteriaImpact, RiskScoreLevel } from '@/types/risk-configuration';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Trash2, Check, LoaderCircle } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from '@/components/ui/stepper';
import { ListTodo, Grid3x3, Layers, Rows, Milestone, Sparkle, Users2 } from 'lucide-react';
import InputColor from '@/components/input-color';
import { RiskColorPresetMini } from '@/components/ui/risk-color-preset';
import FastColorPicker from '@/components/ui/fast-color-picker';

// Progressive color scheme based on risk level count
const getProgressiveColors = (count: number): string[] => {
    const colorSchemes = {
        2: ['#10b981', '#ef4444'], // Green, Red
        3: ['#10b981', '#f59e0b', '#ef4444'], // Green, Yellow, Red
        4: ['#10b981', '#f59e0b', '#f97316', '#ef4444'], // Green, Yellow, Orange, Red
        5: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626'], // Green, Yellow, Orange, Red, Dark Red
        6: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b'], // Green, Yellow, Orange, Red, Dark Red, Darker Red
        7: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red
        8: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#450a0a'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red, Black
        9: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#450a0a', '#000000'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red, Black, Pure Black
        10: ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#dc2626', '#991b1b', '#7f1d1d', '#450a0a', '#000000', '#000000'], // Green, Yellow, Orange, Red, Dark Red, Darker Red, Darkest Red, Black, Pure Black, Pure Black
    };
    
    return colorSchemes[count as keyof typeof colorSchemes] || colorSchemes[3]; // Default to 3-color scheme
};

const defaultColors = [
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f97316', // Orange
    '#ef4444', // Red
    '#dc2626', // Red-600
    '#2563eb', // Blue
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
];

const impactLabels = [
    'Minor', 'Moderate', 'Significant', 'Major', 'Critical',
    'Low', 'Medium', 'High', 'Very High', 'Extreme'
];

const probabilityLabels = [
    'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain',
    'Very Low', 'Low', 'Medium', 'High', 'Very High'
];

const wizardSteps = [
    { title: 'Basic Info', icon: ListTodo },
    { title: 'Scale Config', icon: Grid3x3 },
    { title: 'Impact Levels', icon: Layers },
    { title: 'Probability Levels', icon: Rows },
    { title: 'Risk Score Levels', icon: Milestone },
    // 'Assessment Criteria' step will be injected if useCriterias is true
];

export default function CreateRiskConfiguration() {
    const [useCriterias, setUseCriterias] = useState(false);
    const [scoreLevelCount, setScoreLevelCount] = useState<number>(3);
    const generateDefaultScoreLevels = (count: number) => {
        const progressiveColors = getProgressiveColors(count);
        return Array.from({ length: count }, (_, i) => ({
            label: ['Low', 'Medium', 'High', 'Very High', 'Critical', 'Extreme', 'Extreme+', 'Severe', 'Minor', 'Major'][i] || `Level ${i + 1}`,
            min: i + 1,
            max: i + 1,
            color: progressiveColors[i],
            order: i + 1,
        }));
    };
    const [scoreLevels, setScoreLevels] = useState(generateDefaultScoreLevels(scoreLevelCount));

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        impact_scale_max: number;
        probability_scale_max: number;
        calculation_method: 'avg' | 'max';
        use_criterias: boolean;
        impacts: RiskImpact[];
        probabilities: RiskProbability[];
        criterias: RiskCriteria[];
        score_levels: RiskScoreLevel[];
    }>({
        name: '',
        impact_scale_max: 5,
        probability_scale_max: 5,
        calculation_method: 'max',
        use_criterias: false,
        impacts: [],
        probabilities: [],
        criterias: [],
        score_levels: generateDefaultScoreLevels(scoreLevelCount),
    });

    const generateDefaultImpacts = (count: number): RiskImpact[] => {
        const impacts: RiskImpact[] = [];
        for (let i = 0; i < count; i++) {
            impacts.push({
                label: impactLabels[i] || `Level ${i + 1}`,
                score: i + 1,
                order: i + 1,
            });
        }
        return impacts;
    };

    const generateDefaultProbabilities = (count: number): RiskProbability[] => {
        const probabilities: RiskProbability[] = [];
        for (let i = 0; i < count; i++) {
            probabilities.push({
                label: probabilityLabels[i] || `Level ${i + 1}`,
                score: i + 1,
                order: i + 1,
            });
        }
        return probabilities;
    };

    // Calculate maxScore based on impacts and probabilities
    const maxImpact = data.impacts.length ? Math.max(...data.impacts.map(i => Number(i.score) || 0)) : 1;
    const maxProbability = data.probabilities.length ? Math.max(...data.probabilities.map(i => Number(i.score) || 0)) : 1;
    const totalMaxScore = maxImpact * maxProbability;
    // Auto-distribute scoreLevels min/max
    const autoGenerateScoreLevels = (count: number, maxScore: number) => {
        const step = Math.floor(maxScore / count);
        const progressiveColors = getProgressiveColors(count);
        return Array.from({ length: count }, (_, i) => ({
            label: ['Low', 'Medium', 'High', 'Very High', 'Critical', 'Extreme', 'Extreme+', 'Severe', 'Minor', 'Major'][i] || `Level ${i + 1}`,
            min: i === 0 ? 1 : i * step + 1,
            max: i === count - 1 ? maxScore : (i + 1) * step,
            color: progressiveColors[i],
            order: i + 1,
        }));
    };
    // React to scale/levels change
    const handleScoreLevelCountChange = (count: number) => {
        setScoreLevelCount(count);
        setScoreLevels(autoGenerateScoreLevels(count, totalMaxScore));
    };
    // Re-auto-distribute scoreLevels on impacts/probabilities change
    useEffect(() => {
        setScoreLevels(autoGenerateScoreLevels(scoreLevelCount, totalMaxScore));
        // eslint-disable-next-line
    }, [data.impacts, data.probabilities, scoreLevelCount]);

    const handleScoreLevelFieldChange = (idx: number, field: keyof typeof scoreLevels[0], value: string | number) => {
        setScoreLevels((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
    };

    const handleImpactChange = (index: number, field: keyof RiskImpact, value: string | number) => {
        const newImpacts = [...data.impacts];
        newImpacts[index] = { ...newImpacts[index], [field]: value };
        setData('impacts', newImpacts);
    };

    const handleProbabilityChange = (index: number, field: keyof RiskProbability, value: string | number) => {
        const newProbabilities = [...data.probabilities];
        newProbabilities[index] = { ...newProbabilities[index], [field]: value };
        setData('probabilities', newProbabilities);
    };

    const handleCriteriaChange = (index: number, field: keyof RiskCriteria, value: string) => {
        const newCriterias = [...data.criterias];
        newCriterias[index] = { ...newCriterias[index], [field]: value };
        setData('criterias', newCriterias);
    };

    const addCriteria = () => {
        const newCriteria: RiskCriteria = {
            name: '',
            description: '',
            order: data.criterias.length + 1,
            impacts: Array.from({ length: data.impact_scale_max }).map((_, idx) => ({
                impact_label: impactLabels[idx] || `Impact ${idx + 1}`,
                score: idx + 1,
                order: idx + 1,
            })),
        };
        setData('criterias', [...data.criterias, newCriteria]);
    };

    const removeCriteria = (index: number) => {
        const newCriterias = data.criterias.filter((_, i) => i !== index);
        setData('criterias', newCriterias);
    };

    const addCriteriaImpact = (criteriaIndex: number) => {
        const newCriterias = [...data.criterias];
        const newImpact = {
            impact_label: '',
            score: 1,
            order: newCriterias[criteriaIndex].impacts.length + 1,
        };
        newCriterias[criteriaIndex].impacts.push(newImpact);
        setData('criterias', newCriterias);
    };

    const removeCriteriaImpact = (criteriaIndex: number, impactIndex: number) => {
        const newCriterias = [...data.criterias];
        newCriterias[criteriaIndex].impacts = newCriterias[criteriaIndex].impacts.filter(
            (_, i) => i !== impactIndex
        );
        setData('criterias', newCriterias);
    };

    const handleCriteriaImpactChange = (
        criteriaIndex: number,
        impactIndex: number,
        field: keyof CriteriaImpact,
        value: string | number
    ) => {
        const newCriterias = [...data.criterias];
        newCriterias[criteriaIndex].impacts[impactIndex] = {
            ...newCriterias[criteriaIndex].impacts[impactIndex],
            [field]: value,
        };
        setData('criterias', newCriterias);
    };

    const syncCriteriaImpacts = (impactCount: number) => {
        setData('criterias', data.criterias.map(c => ({
            ...c,
            impacts: Array.from({ length: impactCount }).map((_, idx) => c.impacts[idx] ?? {
                impact_label: impactLabels[idx] || `Impact ${idx + 1}`,
                score: idx + 1,
                order: idx + 1,
            })
        })));
    };

    const handleScaleChange = (type: 'impact' | 'probability', value: number) => {
        if (type === 'impact') {
            setData('impact_scale_max', value);
            setData('impacts', generateDefaultImpacts(value));
            syncCriteriaImpacts(value);
        } else {
            setData('probability_scale_max', value);
            setData('probabilities', generateDefaultProbabilities(value));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Form submitted! Current step:', currentStep, 'Total steps:', dynamicSteps.length);
        console.log('Event target:', e.target);
        console.log('Event currentTarget:', e.currentTarget);

        // Only allow form submission when explicitly requested (isSubmitting is true)
        if (!isSubmitting) {
            console.log('Form submission blocked - not explicitly requested');
            return;
        }

        // Only allow form submission on the final step
        if (currentStep !== dynamicSteps.length) {
            console.log('Form submission blocked - not on final step');
            setIsSubmitting(false);
            return;
        }

        // Validate form
        const errors: Record<string, string> = {};

        if (!data.name.trim()) {
            errors.name = 'Configuration name is required';
        }

        if (data.impacts.some(impact => !impact.label.trim())) {
            errors.impacts = 'All impact levels must have labels';
        }

        if (data.probabilities.some(prob => !prob.label.trim())) {
            errors.probabilities = 'All probability levels must have labels';
        }

        if (data.use_criterias && data.criterias.some(criteria => !criteria.name.trim())) {
            errors.criterias = 'All criteria must have names';
        }

        // Validate score levels only when we're on the final step
        if (currentStep === dynamicSteps.length) {
            if (scoreLevels.some(level => !level.label.trim())) {
                errors.score_levels = 'All score levels must have labels';
            }

            if (scoreLevels.some(level => level.min < 1 || level.max < 1)) {
                errors.score_levels = 'Score level min and max values must be at least 1';
            }

            if (scoreLevels.some(level => level.min > level.max)) {
                errors.score_levels = 'Score level min value cannot be greater than max value';
            }
        }

        // Check for duplicate names
        const impactLabels = data.impacts.map(i => i.label.toLowerCase());
        if (new Set(impactLabels).size !== impactLabels.length) {
            errors.impacts = 'Impact level labels must be unique';
        }

        const probabilityLabels = data.probabilities.map(p => p.label.toLowerCase());
        if (new Set(probabilityLabels).size !== probabilityLabels.length) {
            errors.probabilities = 'Probability level labels must be unique';
        }

        if (currentStep === dynamicSteps.length) {
            const scoreLevelLabels = scoreLevels.map(s => s.label.toLowerCase());
            if (new Set(scoreLevelLabels).size !== scoreLevelLabels.length) {
                errors.score_levels = 'Score level labels must be unique';
            }
        }

        if (Object.keys(errors).length > 0) {
            // Set errors in form state if your form library supports it
            console.error('Validation errors:', errors);
            alert('Please fix the validation errors before submitting');
            return;
        }

        setData('score_levels', scoreLevels);
        post('/risk-configurations');
    };

    // Initialize default data when component mounts
    useEffect(() => {
        if (data.impacts.length === 0) {
            setData('impacts', generateDefaultImpacts(data.impact_scale_max));
        }
        if (data.probabilities.length === 0) {
            setData('probabilities', generateDefaultProbabilities(data.probability_scale_max));
        }
    }, []);

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dynamicSteps = useMemo(() => {
        return data.use_criterias
            ? [...wizardSteps, { title: 'Assessment Criteria', icon: Users2 }]
            : wizardSteps;
    }, [data.use_criterias]);

    // Ensure currentStep doesn't exceed the number of available steps
    useEffect(() => {
        if (currentStep > dynamicSteps.length) {
            setCurrentStep(dynamicSteps.length);
        }
    }, [dynamicSteps.length, currentStep]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Risk Management', href: '/risks' },
                { title: 'Risk Configurations', href: '/risk-configurations' },
                { title: 'Create', href: '/risk-configurations/create' },
            ]}
        >
            <Head title="Create Risk Configuration" />
            <div className="min-h-screen ">
                <form onSubmit={handleSubmit}>
                    <Stepper
                        value={currentStep}
                        onValueChange={(step) => {
                            console.log('Stepper onValueChange called with step:', step, 'currentStep:', currentStep);
                            if (step !== currentStep && step >= 1 && step <= dynamicSteps.length) {
                                console.log('Setting currentStep to:', step);
                                setCurrentStep(step);
                                setIsSubmitting(false); // Reset submitting flag when navigating
                            }
                        }}
                        className="space-y-4 sm:space-y-6 px-2 sm:px-4 py-3 sm:py-6"
                        indicators={{
                            completed: <Check className="size-4" />,
                            loading: <LoaderCircle className="size-4 animate-spin" />,
                        }}
                    >
                        <StepperNav className="relative flex justify-between mb-8 px-2 overflow-x-auto">
                            {dynamicSteps.map((step, idx) => (
                                <StepperItem key={idx} step={idx + 1} className="relative flex-1 text-center group min-w-[100px]">
                                    <StepperTrigger asChild>
                                        <div className="flex flex-col items-center gap-2 px-1">
                                            <div className={`flex items-center justify-center size-8 sm:size-10 rounded-full border-2 transition-all duration-300
            ${currentStep > idx + 1
                                                    ? 'bg-rose-500 border-rose-500 text-white'
                                                    : currentStep === idx + 1
                                                        ? 'border-rose-500 text-rose-600 bg-rose-50'
                                                        : 'border-slate-300 text-slate-400 hover:bg-slate-50 hover:border-slate-400 hover:text-slate-500'}
          `}>
                                                <step.icon className="size-3 sm:size-4" />
                                            </div>
                                            <StepperTitle className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300 leading-tight">
                                                {step.title}
                                            </StepperTitle>
                                        </div>
                                    </StepperTrigger>

                                    {idx < dynamicSteps.length - 1 && (
                                        <div className={`absolute top-4 sm:top-5 left-[calc(50%+1rem)] right-[calc(-50%+1rem)] h-[2px] transition-all duration-500 rounded-full
                                        ${currentStep > idx + 1 ? 'bg-rose-400' : 'bg-slate-200'}`} />
                                    )}
                                </StepperItem>
                            ))}
                        </StepperNav>

                        <StepperPanel className="mb-8">
                            {/* Wizard Panels: only one shown at a time, mapped to currentStep */}
                            {dynamicSteps.map((step, idx) => (
                                <StepperContent key={idx} value={idx + 1} className="flex flex-col gap-4 mx-auto">
                                    {idx === 0 && (
                                        <Card className="border border-slate-200 dark:border-slate-700  rounded-lg p-3 sm:p-4">
                                            <CardHeader className="p-0 mb-3">
                                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Basic Configuration</CardTitle>
                                                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Set up the fundamental parameters for your risk configuration</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0 pt-2">
                                                <div className="grid grid-cols-1 gap-3">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Configuration Name</Label>
                                                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g., Default Risk Configuration" className={` border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`} />
                                                        {errors.name && (<p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2 mt-2"><span className="w-1 h-1 bg-red-500 rounded-full"></span>{errors.name}</p>)}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="calculation_method" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Calculation Method</Label>
                                                        <Select value={data.calculation_method} onValueChange={(value) => setData('calculation_method', value as 'avg' | 'max')}>
                                                            <SelectTrigger className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="max">Maximum</SelectItem>
                                                                <SelectItem value="avg">Average</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex items-center space-x-2 p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                                                        <Checkbox id="use_criterias" checked={data.use_criterias} onCheckedChange={(checked) => { setData('use_criterias', checked as boolean); setUseCriterias(checked as boolean); }} className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600" />
                                                        <Label htmlFor="use_criterias" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">Use criteria-based assessment</Label>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {idx === 1 && (
                                        <Card className="border border-slate-200 dark:border-slate-700  rounded-lg p-3 sm:p-4">
                                            <CardHeader className="p-0 mb-3">
                                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Scale Configuration</CardTitle>
                                                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Define the number of levels for impact and probability scales</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0 pt-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="impact_scale_max" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Impact Scale (2-10)</Label>
                                                        <Select value={data.impact_scale_max.toString()} onValueChange={value => handleScaleChange('impact', parseInt(value))}>
                                                            <SelectTrigger className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                                                                    <SelectItem key={num} value={num.toString()}>{num} Levels</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="probability_scale_max" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Probability Scale (2-10)</Label>
                                                        <Select value={data.probability_scale_max.toString()} onValueChange={value => handleScaleChange('probability', parseInt(value))}>
                                                            <SelectTrigger className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {Array.from({ length: 9 }, (_, i) => i + 2).map(num => (
                                                                    <SelectItem key={num} value={num.toString()}>{num} Levels</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {idx === 2 && (
                                        <Card className="border border-slate-200 dark:border-slate-700  rounded-lg p-3 sm:p-4">
                                            <CardHeader className="p-0 mb-3">
                                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Impact Levels</CardTitle>
                                                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Define the impact levels and their corresponding scores</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0 pt-2">
                                                <div className="grid gap-2">
                                                    {data.impacts.map((impact, index) => (
                                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-3  /50">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Label</Label>
                                                                <Input value={impact.label} onChange={e => handleImpactChange(index, 'label', e.target.value)} placeholder="e.g., Minor" className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Score</Label>
                                                                <Input type="number" step="0.1" value={impact.score} onChange={e => handleImpactChange(index, 'score', parseFloat(e.target.value))} className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Order</Label>
                                                                <Input type="number" value={impact.order} onChange={e => handleImpactChange(index, 'order', parseInt(e.target.value))} className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {idx === 3 && (
                                        <Card className="border border-slate-200 dark:border-slate-700  rounded-lg p-3 sm:p-4">
                                            <CardHeader className="p-0 mb-3">
                                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Probability Levels</CardTitle>
                                                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Define the probability levels and their corresponding scores</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0 pt-2">
                                                <div className="grid gap-2">
                                                    {data.probabilities.map((probability, index) => (
                                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 border border-slate-200 dark:border-slate-700 rounded-lg p-3  /50">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Label</Label>
                                                                <Input value={probability.label} onChange={e => handleProbabilityChange(index, 'label', e.target.value)} placeholder="e.g., Rare" className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Score</Label>
                                                                <Input type="number" step="0.1" value={probability.score} onChange={e => handleProbabilityChange(index, 'score', parseFloat(e.target.value))} className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Order</Label>
                                                                <Input type="number" value={probability.order} onChange={e => handleProbabilityChange(index, 'order', parseInt(e.target.value))} className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                    {idx === 4 && (
                                        <Card className="border border-slate-200 dark:border-slate-700  rounded-lg p-4">
                                            <CardHeader className="p-0 mb-3">
                                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                                                    Risk Score Levels
                                                </CardTitle>
                                                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                                    Define how many <span className="font-semibold text-slate-700 dark:text-slate-300">risk score levels</span> to use.
                                                    Intervals are auto-calculated based on the max score:
                                                    <span className="text-rose-600 dark:text-rose-400 font-semibold ml-1">{totalMaxScore}</span>.
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="p-0 pt-3 space-y-3">
                                                {/* Select for number of levels */}
                                                <div className="space-y-2 max-w-xs">
                                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Number of Levels</Label>
                                                    <Select
                                                        value={scoreLevelCount.toString()}
                                                        onValueChange={(val) => handleScoreLevelCountChange(Number(val))}
                                                    >
                                                        <SelectTrigger className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500">
                                                            <SelectValue placeholder="Select number of levels" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Array.from({ length: 9 }, (_, i) => i + 2).map((n) => (
                                                                <SelectItem key={n} value={n.toString()}>
                                                                    {n} Levels
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <span>Max Score:</span>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200  px-2 py-1 rounded-md">{totalMaxScore}</span>
                                                </div>

                                                {/* Score level rows */}
                                                <div className="grid gap-2">
                                                    {scoreLevels.map((level, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex flex-col gap-3 border border-slate-200 dark:border-slate-700  /50 rounded-lg p-3"
                                                        >
                                                            {/* Label field */}
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Label</Label>
                                                                <Input
                                                                    placeholder="e.g. Low"
                                                                    value={level.label}
                                                                    onChange={(e) => handleScoreLevelFieldChange(idx, 'label', e.target.value)}
                                                                    className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500"
                                                                />
                                                            </div>

                                                            {/* Min + Max + Color row */}
                                                            <div className="flex flex-col sm:flex-row gap-2">
                                                                <div className="flex-1 space-y-2">
                                                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Min</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={level.min}
                                                                        onChange={(e) =>
                                                                            handleScoreLevelFieldChange(idx, 'min', Number(e.target.value))
                                                                        }
                                                                        className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500"
                                                                    />
                                                                </div>

                                                                <div className="flex-1 space-y-2">
                                                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Max</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={level.max}
                                                                        onChange={(e) =>
                                                                            handleScoreLevelFieldChange(idx, 'max', Number(e.target.value))
                                                                        }
                                                                        className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500"
                                                                    />
                                                                </div>

                                                                <div className="flex-1 space-y-2">
                                                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Color</Label>
                                                                    <div className="flex items-center gap-2">


                                                                        <FastColorPicker value={level.color} onChange={(color) => handleScoreLevelFieldChange(idx, 'color', color)} />

                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>



                                    )}
                                    {step.title === 'Assessment Criteria' && (
                                        <Card className="border border-slate-200 dark:border-slate-700  rounded-lg p-3 sm:p-4">
                                            <CardHeader className="p-0 mb-3">
                                                <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">Assessment Criteria</CardTitle>
                                                <CardDescription className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Define criteria for multi-dimensional risk assessment</CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0 pt-2">
                                                {data.criterias.map((criteria, criteriaIndex) => (
                                                    <div key={criteriaIndex} className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg  /50 space-y-3 mb-3">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Criteria {criteriaIndex + 1}</h4>
                                                            <Button type="button" variant="destructive" size="sm" onClick={() => removeCriteria(criteriaIndex)} className="bg-red-500 hover:bg-red-600 text-white">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Criteria Name</Label>
                                                                <Input value={criteria.name} onChange={e => handleCriteriaChange(criteriaIndex, 'name', e.target.value)} placeholder="e.g., Financial" className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500" />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</Label>
                                                                <Textarea value={criteria.description} onChange={e => handleCriteriaChange(criteriaIndex, 'description', e.target.value)} placeholder="Optional description" className=" border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-rose-500 min-h-[50px]" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center">
                                                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Impact Levels for this Criteria</Label>
                                                            </div>
                                                            {criteria.impacts.map((impact, impactIndex) => (
                                                                <div key={impactIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2  rounded border border-slate-200 dark:border-slate-600">
                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Impact Label</Label>
                                                                        <Input value={impact.impact_label} onChange={e => handleCriteriaImpactChange(criteriaIndex, impactIndex, 'impact_label', e.target.value)} placeholder="e.g., Low" className="bg-slate-50 dark:bg-slate-600 border-slate-200 dark:border-slate-500 focus:ring-2 focus:ring-rose-500 text-sm" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Score</Label>
                                                                        <Input type="number" step="0.1" value={impact.score} onChange={e => handleCriteriaImpactChange(criteriaIndex, impactIndex, 'score', parseFloat(e.target.value))} className="bg-slate-50 dark:bg-slate-600 border-slate-200 dark:border-slate-500 focus:ring-2 focus:ring-rose-500 text-sm" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Order</Label>
                                                                        <Input type="number" value={impact.order} onChange={e => handleCriteriaImpactChange(criteriaIndex, impactIndex, 'order', parseInt(e.target.value))} className="bg-slate-50 dark:bg-slate-600 border-slate-200 dark:border-slate-500 focus:ring-2 focus:ring-rose-500 flex-1 text-sm" />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" onClick={addCriteria} className="w-full  border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300">
                                                    <Plus className="h-3 w-3 mr-2" />Add Criteria
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </StepperContent>
                            ))}
                        </StepperPanel>
                        <div className="sticky bottom-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 py-3 sm:py-4 px-3 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={currentStep === 1}
                                onClick={() => {
                                    setCurrentStep(prev => prev - 1);
                                    setIsSubmitting(false);
                                }}
                                className=" border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto order-2 sm:order-1"
                            >
                                <ArrowLeft className="mr-2 size-3" /> Previous
                            </Button>

                            <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                                {currentStep < dynamicSteps.length ? (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setCurrentStep(prev => prev + 1);
                                            setIsSubmitting(false);
                                        }}
                                        className="bg-rose-600 hover:bg-rose-700 text-white flex-1 sm:flex-none"
                                    >
                                        Next Step
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        onClick={() => setIsSubmitting(true)}
                                        className="disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <LoaderCircle className="mr-2 size-3 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 size-3" />
                                                Create Configuration
                                            </>
                                        )}
                                    </Button>
                                )}

                            </div>
                        </div>
                    </Stepper>
                </form>
            </div>
        </AppLayout>
    );
}

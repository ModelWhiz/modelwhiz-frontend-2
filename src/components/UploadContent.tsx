'use client';

import { ChangeEvent, useState, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { startEvaluation } from '@/lib/apiClient';
import { FaHome } from 'react-icons/fa';

// --- CHAKRA UI IMPORTS - OPTIMIZED ---
import { 
  Box, VStack, HStack, Container, Stack
} from '@chakra-ui/react';

import { 
  Heading, Text, Button, Input, FormControl, Icon
} from '@chakra-ui/react';

import { 
  Card, CardBody, Divider, Progress, Badge
} from '@chakra-ui/react';

import { 
  Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';

import { 
  Radio, RadioGroup, useBreakpointValue, useToast
} from '@chakra-ui/react';

import { 
  Breadcrumb, BreadcrumbItem, BreadcrumbLink
} from '@chakra-ui/react';
// --- END CHAKRA UI IMPORTS - OPTIMIZED ---

import { 
  FiUploadCloud, FiFile, FiCheck, FiArrowRight, FiArrowLeft,
  FiDatabase, FiCpu, FiSettings, FiPlay
} from 'react-icons/fi';

import { lazy } from 'react';

// Dynamic import for Navbar
const Navbar = lazy(() => import('@/components/Navbar'));

const UploadContent = memo(function UploadContent() {
  const [step, setStep] = useState(1);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [preprocessorFile, setPreprocessorFile] = useState<File | null>(null);
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [hasPreprocessor, setHasPreprocessor] = useState<boolean | null>(null);
  const [modelName, setModelName] = useState('');
  const [targetColumn, setTargetColumn] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [trainingFile, setTrainingFile] = useState<File | null>(null);
  const [splitData, setSplitData] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const toast = useToast();
  const router = useRouter();
  const { user_id } = useAuth();
  const containerPadding = useBreakpointValue({ base: 4, md: 8 });

  const handleUpload = useCallback(async () => {
    if (!user_id || !modelFile || !datasetFile) {
      setUploadError("Missing required files or user authentication");
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await startEvaluation({
          modelFile,
          datasetFile,
          modelName: modelName.trim(),
          targetColumn: targetColumn.trim(),
          userId: user_id,
          preprocessorFile,
          splitData,
      });
      
      toast({ 
        title: '🚀 Evaluation Started!', 
        description: 'Your model is being processed. You\'ll be redirected to the results.',
        status: 'success', 
        duration: 5000,
        isClosable: true 
      });
      router.push(`/evaluations/${response.job_id}`);
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      let errorMessage = 'An unknown error occurred during evaluation.';
      
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setUploadError(errorMessage);
      
      toast({
        title: '❌ Upload Failed',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  }, [user_id, modelFile, datasetFile, modelName, targetColumn, preprocessorFile, splitData, toast, router]);

  const canProceedToStep2 = useMemo(() => {
    return modelFile && modelName.trim() && hasPreprocessor !== null && 
           (hasPreprocessor !== true || preprocessorFile);
  }, [modelFile, modelName, hasPreprocessor, preprocessorFile]);

  const canStartEvaluation = useMemo(() => {
    return datasetFile && targetColumn.trim();
  }, [datasetFile, targetColumn]);

  const handleStep1Next = useCallback(() => {
    if (canProceedToStep2) {
      setStep(2);
    }
  }, [canProceedToStep2]);

  const handleStep2Back = useCallback(() => {
    setStep(1);
  }, []);

  const handleNavigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const FileUploadCard = useMemo(() => ({ 
    label, 
    accepted, 
    file, 
    onFileChange, 
    description, 
    icon, 
    isRequired = true 
  }: {
    label: string;
    accepted: string;
    file: File | null;
    onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    description?: string;
    icon: React.ComponentType;
    isRequired?: boolean;
  }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []);
    
    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []);
    
    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileChange({ target: { files } } as ChangeEvent<HTMLInputElement>);
      }
    }, [onFileChange]);

    const handleClick = useCallback(() => {
      document.getElementById(`file-${label}`)?.click();
    }, [label]);

    return (
      <Card
        bg="white"
        borderRadius="xl"
        border="2px dashed"
        borderColor={file ? "green.400" : isDragOver ? "purple.400" : "gray.200"}
        transition="all 0.3s"
        _hover={{ 
          borderColor: "purple.400", 
          transform: "translateY(-2px)",
          shadow: "lg"
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        cursor="pointer"
        onClick={handleClick}
      >
        <CardBody p={6}>
          <VStack spacing={4} textAlign="center">
            <Box
              p={4}
              borderRadius="full"
              bg={file ? "green.100" : "purple.100"}
              color={file ? "green.600" : "purple.600"}
            >
              <Icon as={icon} boxSize={6} />
            </Box>
            
            <VStack spacing={2}>
              <HStack>
                <Text fontWeight="bold" fontSize="lg">{label}</Text>
                {isRequired && <Badge colorScheme="red" size="sm">Required</Badge>}
              </HStack>
              {description && (
                <Text fontSize="sm" color="gray.600" maxW="300px">
                  {description}
                </Text>
              )}
            </VStack>

            {file ? (
              <HStack spacing={2} color="green.600">
                <Icon as={FiCheck} />
                <Text fontWeight="medium">{file.name}</Text>
              </HStack>
            ) : (
              <Text fontSize="sm" color="gray.500">
                Click or drag to upload
              </Text>
            )}

            <Input
              id={`file-${label}`}
              type="file"
              accept={accepted}
              onChange={onFileChange}
              display="none"
            />
          </VStack>
        </CardBody>
      </Card>
    );
  }, []);

  const renderStep = useCallback(() => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={8} align="stretch">
            <VStack spacing={6}>
              <Input 
                placeholder="Enter Model Name (e.g., 'Iris Classifier v1')" 
                value={modelName} 
                onChange={(e) => setModelName(e.target.value)}
                size="lg"
                bg="white"
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)" }}
              />
              
              <FileUploadCard
                label="Model File"
                accepted=".pkl,.joblib"
                file={modelFile}
                onFileChange={(e: ChangeEvent<HTMLInputElement>) => setModelFile(e.target.files?.[0] || null)}
                description="Upload your trained model file (.pkl or .joblib format)"
                icon={FiCpu}
              />
            </VStack>

            <Divider borderColor="gray.200" />

            <VStack spacing={4}>
              <Text fontWeight="bold" fontSize="lg" textAlign="center">
                Do you have a separate preprocessor file?
              </Text>
              <HStack spacing={4} justify="center">
                <Button 
                  colorScheme="purple" 
                  variant={hasPreprocessor === false ? 'solid' : 'outline'} 
                  onClick={() => { setHasPreprocessor(false); setPreprocessorFile(null); }}
                  size="lg"
                  borderRadius="xl"
                  px={8}
                >
                  No, just the model
                </Button>
                <Button 
                  colorScheme="purple" 
                  variant={hasPreprocessor === true ? 'solid' : 'outline'} 
                  onClick={() => setHasPreprocessor(true)}
                  size="lg"
                  borderRadius="xl"
                  px={8}
                >
                  Yes, I have one
                </Button>
              </HStack>
              
              {hasPreprocessor === true && (
                <FileUploadCard
                  label="Preprocessor File"
                  accepted=".pkl"
                  file={preprocessorFile}
                  onFileChange={(e: ChangeEvent<HTMLInputElement>) => setPreprocessorFile(e.target.files?.[0] || null)}
                  description="Upload your preprocessor/scaler file (.pkl format)"
                  icon={FiSettings}
                />
              )}
            </VStack>

            <Button
              alignSelf="flex-end"
              colorScheme="purple"
              size="lg"
              rightIcon={<FiArrowRight />}
              isDisabled={!canProceedToStep2}
              onClick={handleStep1Next}
              borderRadius="xl"
              px={8}
            >
              Next Step
            </Button>
          </VStack>
        );
      case 2:
        return (
          <VStack spacing={8} align="stretch">
            {uploadError && (
              <Alert status="error" borderRadius="xl">
                <AlertIcon />
                <Box>
                  <AlertTitle>Upload Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Box>
              </Alert>
            )}
            
            <VStack spacing={6}>
              <Input 
                placeholder="Enter Target Column Name (e.g., 'species')" 
                value={targetColumn} 
                onChange={(e) => setTargetColumn(e.target.value)}
                size="lg"
                bg="white"
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.200"
                _focus={{ borderColor: "purple.400", boxShadow: "0 0 0 1px var(--chakra-colors-purple-400)" }}
              />
              
              <FileUploadCard
                label="Dataset File"
                accepted=".csv"
                file={datasetFile}
                onFileChange={(e: ChangeEvent<HTMLInputElement>) => setDatasetFile(e.target.files?.[0] || null)}
                description="Upload your evaluation dataset (.csv format)"
                icon={FiDatabase}
              />
              
              {hasPreprocessor === false && (
                <FileUploadCard
                  label="Training Data Sample"
                  accepted=".csv"
                  file={trainingFile}
                  onFileChange={(e: ChangeEvent<HTMLInputElement>) => setTrainingFile(e.target.files?.[0] || null)}
                  description="Optional: Upload a sample of your training data for better accuracy"
                  icon={FiFile}
                  isRequired={false}
                />
              )}
            </VStack>

            <Alert status="info" borderRadius="xl" bg="blue.50" border="1px solid" borderColor="blue.200">
              <AlertIcon />
              <Box>
                <AlertTitle>Dataset Configuration</AlertTitle>
                <AlertDescription>
                  Choose how you want to use your dataset for evaluation.
                </AlertDescription>
              </Box>
            </Alert>

            <FormControl>
              <RadioGroup onChange={(val) => setSplitData(val === 'true')} value={String(splitData)}>
                <Stack direction="column" spacing={4}>
                  <Card bg="white" borderRadius="xl" border="2px solid" borderColor={splitData ? "green.200" : "gray.200"}>
                    <CardBody p={4}>
                      <Radio value='true' colorScheme="green">
                        <VStack align="start" spacing={1} ml={2}>
                          <Text fontWeight="bold" color="green.700">
                            🎯 Automatic Split (Recommended)
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            We&apos;ll use a random 80/20 split to train & test, preventing data leakage and ensuring fair evaluation.
                          </Text>
                        </VStack>
                      </Radio>
                    </CardBody>
                  </Card>
                  
                  <Card bg="white" borderRadius="xl" border="2px solid" borderColor={!splitData ? "blue.200" : "gray.200"}>
                    <CardBody p={4}>
                      <Radio value='false' colorScheme="blue">
                        <VStack align="start" spacing={1} ml={2}>
                          <Text fontWeight="bold" color="blue.700">
                            📊 Evaluate on Entire Dataset
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            Use this only if your file is already a dedicated, unseen test set.
                          </Text>
                        </VStack>
                      </Radio>
                    </CardBody>
                  </Card>
                </Stack>
              </RadioGroup>
            </FormControl>

            <HStack w="full" justify="space-between" mt={4}>
              <Button 
                leftIcon={<FiArrowLeft />} 
                onClick={handleStep2Back}
                variant="outline"
                size="lg"
                borderRadius="xl"
              >
                Back
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<FiPlay />}
                isLoading={isUploading}
                loadingText="Starting Evaluation..."
                isDisabled={!canStartEvaluation}
                onClick={handleUpload}
                size="lg"
                borderRadius="xl"
                px={8}
              >
                Start Evaluation
              </Button>
            </HStack>
          </VStack>
        );
      default:
        return null;
    }
  }, [step, modelName, modelFile, hasPreprocessor, preprocessorFile, targetColumn, datasetFile, trainingFile, splitData, isUploading, canProceedToStep2, canStartEvaluation, uploadError, FileUploadCard, handleStep1Next, handleStep2Back, handleUpload]);

  return (
    <>
      <Navbar />
      <Box minH="100vh" bgGradient="linear(to-r, #f8f7ff, #E6D8FD, #f8f7ff)">
        <Container maxW="4xl" p={containerPadding}>
          <VStack spacing={8} align="stretch">
            {/* Breadcrumb */}
            <Breadcrumb fontSize="sm" color="gray.500">
              <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => handleNavigate('/dashboard')} 
                    color="gray.500" 
                    _hover={{ color: 'purple.500' }}
                    cursor="pointer"
                  >
                    <HStack spacing={2}>
                      <Icon as={FaHome} />
                      <Text>Dashboard</Text>
                    </HStack>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink color="gray.500" _hover={{ color: 'purple.500' }}>
                  <HStack spacing={2}>
                    <Icon as={FiUploadCloud} />
                    <Text>Upload Model</Text>
                  </HStack>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            {/* Header */}
            <Box
              bg="white"
              borderRadius="2xl"
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor="rgba(229, 228, 225, 0.6)"
              shadow="2xl"
              p={8}
            >
              <VStack spacing={6}>
                <VStack spacing={2}>
                  <Heading size="lg" color="purple.600" fontWeight="bold" bgGradient="linear(to-r, purple.700, purple.400)"
                    bgClip="text">
                    Upload Your Model
                  </Heading>
                  <Text opacity={0.9} textAlign="center" color="gray.500" >
                    Let&apos;s evaluate your machine learning model with comprehensive metrics
                  </Text>
                </VStack>

                <HStack spacing={4} w="full" justify="center">
                  <HStack spacing={3}>
                    <Box
                      w={10}
                      h={10}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="white"
                      color="purple.600"
                      fontWeight="bold"
                    >
                      <Icon as={FiCpu} boxSize={5} />
                    </Box>
                    <Box
                      w={8}
                      h={1}
                      bg={step >= 2 ? "purple.300" : "rgba(255, 255, 255, 0.3)"}
                      borderRadius="full"
                    />
                    <Box
                      w={10}
                      h={10}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={step >= 2 ? "white" : "rgba(255, 255, 255, 0.2)"}
                      color={step >= 2 ? "purple.600" : "white"}
                      fontWeight="bold"
                    >
                      <Icon as={FiDatabase} boxSize={5} />
                    </Box>
                  </HStack>
                </HStack>

                <Progress 
                  value={(step / 2) * 100} 
                  colorScheme="purple" 
                  size="sm" 
                  w="full" 
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.2)"
                />
              </VStack>
            </Box>

            {/* Main Content */}
            <Card 
              bg="rgba(255, 255, 255, 0.9)" 
              shadow="2xl" 
              borderRadius="2xl" 
              w="full"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.3)"
            >
              <CardBody p={8}>
                {renderStep()}
              </CardBody>
            </Card>
          </VStack>
        </Container>
      </Box>
    </>
  );
})

export default UploadContent

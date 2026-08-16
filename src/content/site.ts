// All portfolio content — data and copy — lives here.
// Components render this; they never hardcode text.

export const profile = {
  name: 'Ram',
  greeting: 'Hi, I’m Ram',
  title: 'Machine Learning Engineer',
  tagline: 'GCP Certified',
  bio: 'I’m a Machine Learning Engineer who enjoys solving difficult problems with data, models, and thoughtful engineering.',
  status: 'Available for opportunities',
  location: 'Kathmandu, Nepal',
  email: 'rammey115@gmail.com',
  github: 'https://github.com/ram-070/',
  linkedin: 'https://www.linkedin.com/in/ram-dular-yadav-1611b0228/',
  facebook: 'https://www.facebook.com/ramdular077',
};

export const about = {
  image: '/portrait.jpg',
  paragraphs: [
    'I’m a Machine Learning Engineer who enjoys turning complex problems into practical solutions with data and AI.',
    'My work spans applied machine learning, predictive modeling, graph ML, and fraud detection. I enjoy working across the entire journey: understanding the problem, exploring the data, building and evaluating models, and turning them into systems that can be used in the real world.',
    'I’m especially interested in problems where the answer isn’t obvious: finding hidden patterns in data, understanding relationships between entities, and building models that can make better decisions at scale.',
    'Beyond the models themselves, I care about **good engineering**, **continuous learning**, and building things that are **genuinely useful**.',
  ],
};

export const education = {
  institution: 'Tribhuvan University — Purwanchal Campus',
  degree: 'Bachelor of Computer Engineering',
  grade: 'Equivalent GPA: 3.2/4.0 · First Division (65.87%)',
  duration: '2021 – 2025',
  thesis: 'AI-Based Online Exam Proctoring System',
  thesisLink: '#research',
};

export type Project = {
  title: string;
  description: string;
  impact: string;
  stack: string[];
  github: string | null;
  demo: string | null;
  image: string | null;
  graph?: boolean;
};

export const projects: Project[] = [
  {
    title: 'AI-Based Online Exam Proctoring System',
    description:
      'Real-time proctoring for remote exams: gaze tracking, face-spoofing detection, and object detection flag suspicious activity as it happens.',
    impact: 'Published at the IOE Graduate Conference; makes remote assessment auditable for administrators.',
    stack: ['YOLOv8', 'MediaPipe', 'OpenCV', 'Django', 'PostgreSQL'],
    github: 'https://github.com/ram-070/AI-Based-online-exam-proctoring-System',
    demo: 'https://youtu.be/O8kfFmwkfOU?si=y5bgmDwDx3VHbjbI',
    image: '/ai-based-proctor.png',
  },
  {
    title: 'Interview Agent',
    description:
      'Multi-agent LLM system that runs dynamic mock interviews — generating follow-up questions and scoring responses with structured feedback.',
    impact: 'Simulates realistic technical and behavioural interviews end-to-end.',
    stack: ['LangChain', 'LLMs', 'Multi-Agent', 'Prompt Engineering'],
    github: 'https://github.com/ram-070/Interview-Agent',
    demo: null,
    image: '/IA.png',
  },
  {
    title: 'Fake News Detection',
    description:
      'BERT-based classifier that identifies fake news articles using contextual embeddings and a fine-tuned transformer architecture.',
    impact: 'High-accuracy detection from headline and body text alone.',
    stack: ['BERT', 'Transformers', 'NLP', 'PyTorch'],
    github: 'https://github.com/ram-070/Fake-News-Detection-using-NLP-and-Deep-Learning',
    demo: null,
    image: '/FN.png',
  },
  {
    title: 'Advanced Multimodal RAG Assistant',
    description:
      'Retrieval-augmented assistant that combines text and image understanding for document Q&A across PDFs, images, and mixed media.',
    impact: 'One retrieval layer over heterogeneous documents instead of format-specific tooling.',
    stack: ['RAG', 'Vector Retrieval', 'Multimodal', 'LLMs'],
    github: 'https://github.com/ram-070/Advanced-Multimodal-RAG-Assistant',
    demo: null,
    image: '/Rag.png',
  },
  {
    title: 'Image Caption Generator',
    description:
      'Attention-based encoder–decoder that writes natural-language captions for images: CNN encoder, LSTM decoder, Bahdanau attention.',
    impact: 'Demonstrates the full vision-to-language pipeline from raw pixels to fluent text.',
    stack: ['CNN', 'LSTM', 'Attention', 'Computer Vision'],
    github: 'https://github.com/ram-070/Image_caption_generator',
    demo: null,
    image: '/imag-gen.png',
  },
  {
    title: 'GNN-Based Bonus Abuse Detection',
    description:
      'Heterogeneous graph neural network that models players, devices, IPs, affiliates, and bonuses to surface abuse rings rule-based checks miss.',
    impact: 'Finds shared-device and shared-IP links between accounts that evade traditional fraud rules.',
    stack: ['GNN', 'Graph ML', 'Fraud Detection'],
    github: null,
    demo: null,
    image: null,
    graph: true,
  },
];

export const publication = {
  title: 'AI-based Online Exam Proctoring System',
  authors:
    'Ramdular Yadav, Khushilal Mahato, Sunny Ravidas, Sushant Lal Karn, Dharti Raj Shah, Pukar Karki',
  affiliation:
    'Department of Electronics and Computer Engineering, Purwanchal Campus, IOE, Tribhuvan University, Nepal',
  venue: 'Proceedings of IOE Graduate Conference · Volume 16 · April 2026',
  abstract:
    'An AI-based online examination proctoring system built to tackle the challenges of maintaining integrity in remote exams. It combines YOLOv8 for object detection, MediaPipe for gaze tracking, and PyAudio-based audio analysis to flag unauthorized tab switching, restricted objects, and multiple faces in frame. Built on Django with PostgreSQL, the system logs and reports suspicious activity in real time for administrators.',
  keywords: ['AI-Based Proctoring', 'YOLOv8', 'Gaze Tracking', 'MediaPipe', 'Audio Analysis', 'Remote Examination'],
  pdf: '/publications/ai-proctoring-research-paper.pdf',
};

export const skillGroups = [
  {
    category: 'ML & Deep Learning',
    items: [
      'ML Algorithms',
      'Deep Learning',
      'Neural Networks',
      'Graph Neural Networks (GNN)',
      'Transfer Learning',
      'Reinforcement Learning',
    ],
  },
  {
    category: 'NLP & LLMs',
    items: ['Transformers', 'BERT / GPT', 'LangChain', 'RAG Systems', 'Prompt Engineering'],
  },
  {
    category: 'Computer Vision',
    items: ['Image Classification', 'Object Detection', 'Face Recognition', 'OCR', 'OpenCV'],
  },
  {
    category: 'Frameworks',
    items: ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Hugging Face'],
  },
  {
    category: 'Languages & Tools',
    items: ['Python', 'SQL', 'GQL', 'Bash', 'Docker', 'Git'],
  },
  {
    category: 'Cloud & MLOps',
    items: ['Google Cloud', 'BigQuery', 'Vertex AI Workbench', 'AWS', 'FastAPI', 'Streamlit', 'AI Studio'],
  },
];

export type Experience = {
  role: string;
  company: string;
  duration: string;
  type: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export const experiences: Experience[] = [
  {
    role: 'Machine Learning Engineer',
    company: 'Fusemachines',
    duration: 'Sep 2025 – Present',
    type: 'Full-time',
    summary: 'Production AI systems spanning fraud detection, customer insight extraction, and demand forecasting.',
    highlights: [
      'Built end-to-end abuser detection for a sports betting platform using XGBoost and GNN on GCP — engineered 62 features and a player fraud graph across 6M+ players, achieving ROC-AUC 0.95 and 99.9% Precision@1000',
      'Built an AI-powered platform that converts e-commerce product reviews into structured insights and sentiment summaries',
      'Developed a system to analyze customer feedback and generate product improvement and design recommendations',
      'Created automated workflows to classify reviews and highlight key issues, trends, and customer needs',
      'Produced visual and text-based outputs to support better product decision-making',
      'Designed and deployed a demand forecasting pipeline to optimize inventory planning for a furniture retail brand, reducing stockouts and overstock risk',
      'Built and compared multiple time series and ML models (Linear Regression, XGBoost, Prophet), selecting the best-performing model based on MAE and RMSE',
      'Engineered features including seasonality trends, lag variables, and rolling statistics to improve forecast accuracy',
      'Implemented the Prophet model for seasonality-aware forecasting and benchmarked it against baseline ML approaches',
    ],
    stack: ['GNN', 'XGBoost', 'LLMs', 'Time Series', 'Prophet', 'NLP', 'MLOps'],
  },
  {
    role: 'AI / ML Intern',
    company: 'Fusemachines',
    duration: 'May 2025 – Sep 2025',
    type: 'Internship',
    summary: 'LLM-powered multi-agent interview simulation.',
    highlights: [
      'Built an LLM-powered Interview Agent using LangChain for dynamic and human-like interview simulations',
      'Designed and curated technical learning materials for the AI Fellowship program covering evaluation metrics, model stability, and self-supervised learning',
    ],
    stack: ['LangChain', 'LLMs', 'Multi-Agent'],
  },
  {
    role: 'AI Fellowship',
    company: 'Fusemachines',
    duration: 'Apr 2024 – Nov 2024',
    type: 'Fellowship',
    summary: 'Intensive end-to-end AI programme: ML, CV, NLP, and deployment.',
    highlights: [
      'Completed a competitive 6-month fellowship focused on Machine Learning, Deep Learning, Computer Vision, NLP, and MLOps',
      'Developed and deployed end-to-end AI solutions including predictive models, web scraping pipelines, and real-time applications using Streamlit and Docker',
      'Explored advanced concepts such as Transformers, Large Language Models, and Generative AI',
      'Collaborated on team-based research projects, improving problem-solving, communication, and production-level AI system development',
    ],
    stack: ['Deep Learning', 'NLP', 'Computer Vision', 'Docker'],
  },
  {
    role: 'Data Analyst',
    company: 'Karma Technology',
    duration: 'Nov 2023 – May 2024',
    type: 'Full-time',
    summary: 'High-quality datasets for data-driven business decisions.',
    highlights: [
      'Created and curated high-quality datasets crucial to the team’s data-driven projects',
      'Supported business-intelligence workflows and insight reporting',
    ],
    stack: ['SQL', 'Data Processing', 'BI'],
  },
];

export const certifications = [
  {
    title: 'Google Cloud Certified Professional ML Engineer',
    issuer: 'Google Cloud',
    date: 'January 2024',
    url: 'https://drive.google.com/file/d/1TRZJzL6A3WS_ajHZFnt-RvVv050JAU6b/view',
    image: '/cert1.png',
  },
  {
    title: 'Microdegree in Artificial Intelligence',
    issuer: 'Fusemachines AI Fellowship',
    date: 'December 2023',
    url: 'https://drive.google.com/file/d/1U1XAsaa8Ntjb2F0c3a0GbZfgZi8b73oU/view',
    image: '/cert2.png',
  },
];

export const contact = {
  lede: 'I’m open to full-time roles, freelance projects, and collaborations in the ML/AI space. Tell me what you’re building — I read everything.',
};

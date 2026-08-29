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
  grade: 'Equivalent GPA: 2.8/4.0 · First Division (65.87%)',
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
      'Real-time proctoring for remote exams: YOLOv8 flags banned objects from webcam input, MediaPipe and OpenCV track face, eye gaze, and head direction, and audio monitoring catches unusual sounds — with tab-switch and full-screen-exit detection and automated behavioural reports every 5 minutes.',
    impact: '90% accuracy detecting cheating behaviours; published at the IOE Graduate Conference and makes remote assessment auditable for administrators.',
    stack: ['YOLOv8', 'MediaPipe', 'OpenCV', 'Django', 'PostgreSQL'],
    github: 'https://github.com/ram-070/AI-Based-online-exam-proctoring-System',
    demo: 'https://youtu.be/O8kfFmwkfOU?si=y5bgmDwDx3VHbjbI',
    image: '/ai-based-proctor.png',
  },
  {
    title: 'Interview Agent',
    description:
      'Multi-agent mock interview system built with LangChain and the Gemini LLM. Custom ResumeParserTool and JDParserTool let the LLM reason over parsed resumes and job descriptions, with dedicated agents for Q&A, Evaluation, Follow-Up, and Chitchat.',
    impact: 'Simulates realistic, personalized technical and behavioural interviews end-to-end.',
    stack: ['LangChain', 'Gemini', 'Multi-Agent', 'Prompt Engineering'],
    github: 'https://github.com/ram-070/Interview-Agent',
    demo: null,
    image: '/IA.png',
  },
  {
    title: 'Fake News Detection',
    description:
      'Classification pipeline combining ML, deep learning (LSTM, CNN), and Transformers, benchmarked on the WELFake and FakeNewsNet datasets, with a real-time prediction interface deployed via Streamlit and Docker.',
    impact: '98.2% accuracy on WELFake with fine-tuned BERT; 73.5% generalization accuracy on FakeNewsNet using a BERT + CNN + LSTM hybrid.',
    stack: ['BERT', 'Transformers', 'NLP', 'PyTorch'],
    github: 'https://github.com/ram-070/Fake-News-Detection-using-NLP-and-Deep-Learning',
    demo: null,
    image: '/FN.png',
  },
  {
    title: 'Advanced Multimodal RAG Assistant',
    description:
      'Retrieval-augmented Q&A system for multi-format documents (PDF, Word, TXT) and images (charts, scanned notes) — Gemini Vision for image captioning, ChromaDB for persistent text and image embeddings, semantic text chunking, and a Streamlit UI.',
    impact: 'RAGAS-driven evaluation loop for response quality and hallucination reduction across heterogeneous documents.',
    stack: ['RAG', 'ChromaDB', 'Gemini Vision', 'RAGAS', 'LLMs'],
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
    category: 'Programming Languages',
    items: ['Python', 'C/C++', 'SQL', 'Bash'],
  },
  {
    category: 'AI & Agentic Frameworks',
    items: ['LangChain', 'RAG Systems', 'Prompt Engineering', 'Generative AI'],
  },
  {
    category: 'Machine Learning & Data Science',
    items: ['Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Time Series Forecasting', 'XGBoost'],
  },
  {
    category: 'Deep Learning & Graph Analytics',
    items: ['TensorFlow', 'Keras', 'PyTorch', 'PyTorch Geometric', 'Heterogeneous GNNs', 'OpenCV'],
  },
  {
    category: 'Natural Language Processing',
    items: ['HuggingFace Transformers', 'SpaCy', 'NLTK', 'BERT', 'GPT', 'NER', 'Summarization'],
  },
  {
    category: 'Web & API Development',
    items: ['FastAPI', 'Flask', 'Django', 'RESTful APIs', 'Streamlit'],
  },
  {
    category: 'Databases',
    items: ['MySQL', 'PostgreSQL', 'Google BigQuery'],
  },
  {
    category: 'Cloud & Deployment',
    items: ['Google Cloud Platform (GCP)', 'Docker', 'Model Deployment'],
  },
  {
    category: 'Explainability & Evaluation',
    items: ['SHAP', 'PR-AUC Optimization', 'RAGAS'],
  },
  {
    category: 'Workflow Automation',
    items: ['n8n', 'Claude Code'],
  },
];

export type Experience = {
  role: string;
  company: string;
  duration: string;
  type: string;
  highlights: string[];
  stack: string[];
};

export const experiences: Experience[] = [
  {
    role: 'Machine Learning Engineer',
    company: '**Entain** (Client Engagement via Fusemachines Inc.)',
    duration: 'Jun 2026 – Sep 2026',
    type: 'Remote',
    highlights: [
      'Built a fraud and abuse detection system for **Entain**, a global online gaming and sports-betting platform, to identify suspicious players and coordinated abuser rings',
      'Built an end-to-end Player 360 ML and Graph Analytics platform for abuser and multi-accounting detection across a 20M+ player ecosystem, supporting proactive fraud investigation and account-risk prioritization',
      'Designed scalable BigQuery-based data pipelines integrating transactional, behavioral, and graph data across nodes such as players, devices, IP addresses, bonuses, and affiliates',
      'Engineered behavioral and abuse-detection features covering deposits, withdrawals, bet flow, session activity, and timing-velocity, along with graph-based features such as connectivity, neighborhood statistics, and shared-entity patterns, using relationship and hub-size filtering to reduce graph noise',
      'Developed XGBoost and Heterogeneous GNN models for abuse and multi-accounting detection, with the GNN achieving 0.715 PR-AUC and 0.95+ ROC-AUC on a highly imbalanced 4.6M+ player dataset; applied SHAP-based explainability to support analyst investigations',
      'Built leakage-safe, time-aware training pipelines and a scheduled daily inference system with automated resource monitoring for production deployment',
    ],
    stack: ['XGBoost', 'Heterogeneous GNN', 'BigQuery', 'SHAP', 'Graph ML', 'GCP'],
  },
  {
    role: 'Machine Learning Engineer (Full-Time)',
    company: 'Fusemachines Inc.',
    duration: 'Sep 2025 – May 2026',
    type: 'Full-time',
    highlights: [
      'Built an AI-powered platform that converts e-commerce product reviews into structured insights and sentiment summaries',
      'Developed a system to analyze customer feedback and generate product improvement and design recommendations',
      'Created automated workflows to classify reviews and highlight key issues, trends, and customer needs',
      'Produced visual and text-based outputs to support better product decision-making',
      'Designed and deployed a demand forecasting pipeline to optimize inventory planning for a furniture retail brand, reducing stockouts and overstock risk',
      'Built and compared multiple time series and ML models (Linear Regression, XGBoost, Prophet), selecting the best-performing model based on MAE and RMSE',
      'Engineered features including seasonality trends, lag variables, and rolling statistics to improve forecast accuracy',
      'Implemented the Prophet model for seasonality-aware forecasting and benchmarked it against baseline ML approaches',
    ],
    stack: ['NLP', 'Sentiment Analysis', 'Time Series', 'Prophet', 'XGBoost'],
  },
  {
    role: 'AI / ML Intern',
    company: 'Fusemachines Inc.',
    duration: 'May 2025 – Sep 2025',
    type: 'Internship',
    highlights: [
      'Built an LLM-powered Interview Agent using LangChain for dynamic, multi-agent interview simulations',
      'Designed and curated technical learning materials for the AI Fellowship program covering evaluation metrics, model stability, and self-supervised learning',
    ],
    stack: ['LangChain', 'LLMs', 'Multi-Agent'],
  },
  {
    role: 'AI Fellowship',
    company: 'Fusemachines Inc.',
    duration: 'Apr 2024 – Nov 2024',
    type: 'Fellowship',
    highlights: [
      'Completed a competitive 6-month fellowship focused on Machine Learning, Deep Learning, Computer Vision, NLP, and MLOps',
      'Developed and deployed end-to-end AI solutions including predictive models, web scraping pipelines, and real-time applications using Streamlit and Docker',
      'Explored advanced concepts including Transformers, Large Language Models, and Generative AI in research-driven and production-ready projects',
    ],
    stack: ['Deep Learning', 'NLP', 'Computer Vision', 'Docker'],
  },
  {
    role: 'Data Analyst',
    company: 'Karma Technology',
    duration: 'Nov 2023 – May 2024',
    type: 'Full-time',
    highlights: [
      'Created and curated high-quality datasets for the team’s data-driven projects, contributing to effective decision-making',
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

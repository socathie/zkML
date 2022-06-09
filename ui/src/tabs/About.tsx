import ReactMarkdown from 'react-markdown';

export default function About() {

  const md = `# zkML: Demo for circomlib-ml on Harmony testnet`;

  return (
    <ReactMarkdown children={md}/>
  );
}
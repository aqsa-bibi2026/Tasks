import React from 'react'; import { Mail } from 'lucide-react'; import TextInput from './TextInput.jsx';
export default function EmailInput(props){return <TextInput {...props} type="email" icon={Mail}/>}

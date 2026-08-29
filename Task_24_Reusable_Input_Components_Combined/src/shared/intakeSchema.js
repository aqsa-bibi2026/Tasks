import { z } from 'zod';
export const intakeSchema = z.object({
  clientName:z.string().trim().min(3,'Client name must be at least 3 characters.').max(70),
  email:z.string().trim().toLowerCase().email('Enter a valid business email.'),
  company:z.string().trim().min(2,'Company is required.').max(100),
  projectType:z.enum(['Website','Web Application','Dashboard','E-commerce','SaaS Platform','Other'],{error:'Select a project type.'}),
  budget:z.enum(['Under $1k','$1k – $5k','$5k – $15k','$15k – $50k','$50k+'],{error:'Select a budget range.'}),
  password:z.string().min(8,'Password must be at least 8 characters.').regex(/[A-Z]/,'Add one uppercase letter.').regex(/[0-9]/,'Add one number.'),
  description:z.string().trim().min(20,'Add at least 20 characters.').max(500,'Maximum 500 characters.'),
  updates:z.boolean()
});

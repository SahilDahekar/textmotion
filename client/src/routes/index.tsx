import { TextareaForm } from '@/components/TextAreaForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className='flex flex-col h-screen px-12 py-6'>
      <div className='text-center'>
        <h1 className='text-4xl text-center font-bold my-6'>TextMotion</h1>
        <p className='my-4'>Make animation blazingly fast </p>
      </div>
      <div className=''>
        <TextareaForm/>
      </div>
    </div>
  )
}

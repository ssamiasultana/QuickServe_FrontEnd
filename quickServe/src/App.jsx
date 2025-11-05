import { Outlet } from 'react-router'
import colors from './components/ui/color'
import SideBar from './components/SideBar'

function App() {
 return (
    <div className='flex h-screen' style={{ background: colors.neutral[50] }}>
      <SideBar />
      <main className='flex-1 p-6 overflow-auto'>
        <div className='max-w-7xl mx-auto'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default App

import { Routes, Route, Link } from 'react-router-dom'
import ReservationPage from './pages/ReservationPage'
import LessonDetailPage from './pages/LessonDetailPage'
import TutorManagementPage from './pages/TutorManagementPage'

function Nav() {
  return (
    <nav style={{
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: '18px', color: '#4F46E5', textDecoration: 'none' }}>
          EduTalk
        </Link>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/reservation" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>
            예약
          </Link>
          <Link to="/my/tutor-management" style={{ color: '#374151', textDecoration: 'none', fontSize: '14px' }}>
            튜터 관리
          </Link>
        </div>
      </div>
    </nav>
  )
}

function HomePage() {
  return (
    <div style={{ padding: '16px', maxWidth: '480px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Sprint Preview: test-tutor-excl</h1>
      <p style={{ color: '#6B7280', marginBottom: '24px' }}>
        EduTalk Tutor Exclusion - 수업 후 평가 + 튜터 차단 기능 프로토타입
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Link to="/reservation" style={{
          display: 'block', padding: '16px', background: '#EEF2FF', borderRadius: '12px',
          textDecoration: 'none', color: '#4F46E5', fontWeight: 600,
        }}>
          Flow 1: 예약 탭 + 수업 후 평가 팝업
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 400, marginTop: '4px' }}>
            별점 + 사유 선택 + 차단 제안 체크박스
          </p>
        </Link>
        <Link to="/lesson/12345" style={{
          display: 'block', padding: '16px', background: '#FEF3C7', borderRadius: '12px',
          textDecoration: 'none', color: '#92400E', fontWeight: 600,
        }}>
          Flow 2: 수업 상세 + 직접 차단
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 400, marginTop: '4px' }}>
            수업 이력에서 바로 튜터 차단
          </p>
        </Link>
        <Link to="/my/tutor-management" style={{
          display: 'block', padding: '16px', background: '#ECFDF5', borderRadius: '12px',
          textDecoration: 'none', color: '#065F46', fontWeight: 600,
        }}>
          Flow 3: 차단 관리 페이지
          <p style={{ fontSize: '13px', color: '#6B7280', fontWeight: 400, marginTop: '4px' }}>
            차단 목록 조회 + 해제 + 비활성 표시
          </p>
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/lesson/:lessonId" element={<LessonDetailPage />} />
        <Route path="/my/tutor-management" element={<TutorManagementPage />} />
      </Routes>
    </div>
  )
}

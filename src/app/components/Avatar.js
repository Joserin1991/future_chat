'use client';

const Avatar = ({ role }) => {
  // 根据角色返回不同的头像SVG
  const getAvatarSVG = () => {
    if (role === 'designer') {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#E1F0FF"/>
          <circle cx="20" cy="15" r="6" fill="#2563EB"/>
          <path d="M8 35C8 29.4772 12.4772 25 18 25H22C27.5228 25 32 29.4772 32 35V40H8V35Z" fill="#2563EB"/>
          <circle cx="20" cy="20" r="19.5" stroke="#2563EB" strokeOpacity="0.1"/>
        </svg>
      );
    } else if (role === 'professor') {
      return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#F3E8FF"/>
          <circle cx="20" cy="15" r="6" fill="#9333EA"/>
          <path d="M8 35C8 29.4772 12.4772 25 18 25H22C27.5228 25 32 29.4772 32 35V40H8V35Z" fill="#9333EA"/>
          <path d="M14 12H26V15C26 17.7614 23.7614 20 21 20H19C16.2386 20 14 17.7614 14 15V12Z" fill="#9333EA"/>
          <rect x="17" y="8" width="6" height="2" fill="#9333EA"/>
          <circle cx="20" cy="20" r="19.5" stroke="#9333EA" strokeOpacity="0.1"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="avatar">
      {getAvatarSVG()}
    </div>
  );
};

export default Avatar; 
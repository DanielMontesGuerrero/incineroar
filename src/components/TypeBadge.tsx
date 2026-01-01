import { Tag } from 'antd';

import { getContrastYIQ } from '../utils/style';

const COLORS = {
  normal: '#9FA19F' as const,
  fire: '#E62829' as const,
  water: '#2980EF' as const,
  electric: '#FAC000' as const,
  grass: '#3FA129' as const,
  ice: '#3DCEF3' as const,
  fighting: '#FF8000' as const,
  poison: '#9141CB' as const,
  ground: '#915121' as const,
  flying: '#81B9EF' as const,
  psychic: '#EF4179' as const,
  bug: '#91A119' as const,
  rock: '#AFA981' as const,
  ghost: '#704170' as const,
  dragon: '#5060E1' as const,
  dark: '#624D4E' as const,
  steel: '#60A1B8' as const,
  fairy: '#EF70EF' as const,
  stellar: '#40B5A5' as const,
};

interface TypeBadgeProps {
  type?: string;
}

const TypeBadge = ({ type }: TypeBadgeProps) => {
  const color = type
    ? COLORS[type.toLowerCase() as keyof typeof COLORS]
    : '#68A090';
  return (
    <Tag color={color} style={{ color: getContrastYIQ(color) }}>
      {type || 'unknown'}
    </Tag>
  );
};

export default TypeBadge;

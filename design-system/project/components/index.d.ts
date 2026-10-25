import type * as React from 'react';

export type VitalKind = 'weight' | 'bp' | 'sugar' | 'pulse' | 'spo2' | 'temp';
export type Tone = 'good' | 'watch' | 'attention' | 'unknown';

export interface GlassPanelProps { material?: 'glass' | 'strong' | 'solid'; radius?: 'card' | 'panel' | 'inner'; padding?: number | string; style?: React.CSSProperties; className?: string; role?: string; 'aria-label'?: string; children?: React.ReactNode }
export declare function GlassPanel(props: GlassPanelProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'confirm' | 'secondary' | 'ghost' | 'danger'; size?: 'md' | 'lg'; icon?: React.ReactNode }
export declare function Button(props: ButtonProps): React.ReactElement;

export interface StatusChipProps { tone?: Tone; children: React.ReactNode }
export declare function StatusChip(props: StatusChipProps): React.ReactElement;

export interface FreshnessChipProps { state?: 'fresh' | 'recent' | 'stale' | 'error'; children: React.ReactNode }
export declare function FreshnessChip(props: FreshnessChipProps): React.ReactElement;

export interface SparklineProps { values: number[]; color?: string; width?: number; height?: number; endDot?: boolean; 'aria-label'?: string }
export declare function Sparkline(props: SparklineProps): React.ReactElement;

export interface VitalCardProps { kind: VitalKind; label?: string; value: string; unit?: string; meta: string; series?: number[]; status?: { tone: Tone; text: string }; highlight?: boolean; stale?: boolean; discreet?: boolean; style?: React.CSSProperties }
export declare function VitalCard(props: VitalCardProps): React.ReactElement;

export interface RingProgressProps { value: number; size?: number; stroke?: number; color?: string; 'aria-label'?: string; children?: React.ReactNode }
export declare function RingProgress(props: RingProgressProps): React.ReactElement;

export interface FaceOrbProps { state?: 'idle' | 'scanning' | 'recognized' | 'unknown'; progress?: number; size?: number; 'aria-label'?: string }
export declare function FaceOrb(props: FaceOrbProps): React.ReactElement;

export interface ReadingIslandProps { children: React.ReactNode }
export declare function ReadingIsland(props: ReadingIslandProps): React.ReactElement;

export interface DockItem { label: string; detail?: string; badge?: number | string }
export interface DockProps { items: DockItem[] }
export declare function Dock(props: DockProps): React.ReactElement;

export interface FamilyAvatarProps { name: string; note?: string; progress?: number; tone?: 'good' | 'watch'; add?: boolean; size?: number }
export declare function FamilyAvatar(props: FamilyAvatarProps): React.ReactElement;

export interface MedicineCardProps { name: string; detail: string; taken?: boolean; takenAt?: string; onTake?: () => void }
export declare function MedicineCard(props: MedicineCardProps): React.ReactElement;

export interface VisitCardProps { doctor: string; specialty?: string; when: string; place?: string; token?: number; nowServing?: number }
export declare function VisitCard(props: VisitCardProps): React.ReactElement;

export interface WeatherCardProps { place?: string; temp: string; summary: string; detail?: string }
export declare function WeatherCard(props: WeatherCardProps): React.ReactElement;

export interface AmbientClockProps { time?: string; ampm?: string; date?: string }
export declare function AmbientClock(props: AmbientClockProps): React.ReactElement;

export interface BannerProps { tone?: 'info' | 'offline' | 'attention'; title: string; action?: string; children?: React.ReactNode }
export declare function Banner(props: BannerProps): React.ReactElement;

export interface PinPadProps { length?: 4 | 6; filled?: number; title?: string }
export declare function PinPad(props: PinPadProps): React.ReactElement;

export interface OrbitViewProps { greeting: string; script?: 'si' | 'ta' | 'en'; subtitle?: string; time?: string; weather?: string; state?: FaceOrbProps['state']; vitals: VitalCardProps[]; island?: string; dock?: DockItem[] }
export declare function OrbitView(props: OrbitViewProps): React.ReactElement;

declare global { interface Window { CureHome: { GlassPanel: typeof GlassPanel; Button: typeof Button; StatusChip: typeof StatusChip; FreshnessChip: typeof FreshnessChip; Sparkline: typeof Sparkline; VitalCard: typeof VitalCard; RingProgress: typeof RingProgress; FaceOrb: typeof FaceOrb; ReadingIsland: typeof ReadingIsland; Dock: typeof Dock; FamilyAvatar: typeof FamilyAvatar; MedicineCard: typeof MedicineCard; VisitCard: typeof VisitCard; WeatherCard: typeof WeatherCard; AmbientClock: typeof AmbientClock; Banner: typeof Banner; PinPad: typeof PinPad; OrbitView: typeof OrbitView } } }

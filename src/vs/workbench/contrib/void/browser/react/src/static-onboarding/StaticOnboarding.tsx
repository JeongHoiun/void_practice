import { useEffect, useState, useRef } from 'react';
import { ChevronRight, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAccessor } from '../util/services.js';

// workbench의 주요 영역들과 설명
const ONBOARDING_STEPS = [
	{
		id: 'welcome',
		title: 'Void 워크벤치에 오신 것을 환영합니다!',
		description: '이제 Void의 주요 인터페이스 요소들을 함께 살펴보겠습니다. 각 영역을 클릭하여 다음 단계로 진행하세요.',
		targetSelector: null,
		position: 'center'
	},
	{
		id: 'activitybar',
		title: '액티비티 바',
		description: '왼쪽에 있는 액티비티 바입니다. 여기서 탐색기, 검색, Git, 확장프로그램 등에 빠르게 접근할 수 있습니다. 아이콘을 클릭해보세요!',
		targetSelector: '.monaco-workbench .part.activitybar',
		position: 'right'
	},
	{
		id: 'sidebar',
		title: '사이드바',
		description: '현재 선택된 액티비티의 세부 내용이 표시되는 영역입니다. 파일 탐색기, 검색 결과, Git 변경사항 등을 볼 수 있습니다.',
		targetSelector: '.monaco-workbench .part.sidebar',
		position: 'right'
	},
	{
		id: 'editor',
		title: '에디터 영역',
		description: '코드를 작성하고 편집하는 중앙 영역입니다. 여러 탭을 열어 동시에 여러 파일을 작업할 수 있습니다. Void의 AI 기능들도 여기서 사용할 수 있습니다.',
		targetSelector: '.monaco-workbench .part.editor',
		position: 'top'
	},
	{
		id: 'panel',
		title: '패널 영역',
		description: '터미널, 문제, 출력, 디버그 콘솔 등이 표시되는 하단 영역입니다. 개발 중 필요한 도구들에 빠르게 접근할 수 있습니다.',
		targetSelector: '.monaco-workbench .part.panel',
		position: 'top'
	},
	{
		id: 'statusbar',
		title: '상태 표시줄',
		description: '현재 파일 정보, Git 브랜치, 인코딩, 줄/열 번호 등의 상태 정보가 표시됩니다.',
		targetSelector: '.monaco-workbench .part.statusbar',
		position: 'top'
	},
	{
		id: 'complete',
		title: '온보딩 완료!',
		description: '이제 Void의 주요 인터페이스를 모두 살펴보았습니다. 궁금한 점이 있으면 언제든지 Void의 AI 어시스턴트에게 물어보세요!',
		targetSelector: null,
		position: 'center'
	}
];

interface TooltipProps {
	step: typeof ONBOARDING_STEPS[0];
	targetElement: HTMLElement | null;
	onNext: () => void;
	onPrev: () => void;
	onClose: () => void;
	currentStepIndex: number;
	totalSteps: number;
}

const Tooltip = ({ step, targetElement, onNext, onPrev, onClose, currentStepIndex, totalSteps }: TooltipProps) => {
	const [position, setPosition] = useState({ top: 0, left: 0 });
	const tooltipRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!targetElement || !tooltipRef.current) {
			// Center position for welcome and complete steps
			setPosition({
				top: window.innerHeight / 2,
				left: window.innerWidth / 2
			});
			return;
		}

		const rect = targetElement.getBoundingClientRect();
		const tooltipRect = tooltipRef.current.getBoundingClientRect();

		let top = 0;
		let left = 0;

		switch (step.position) {
			case 'right':
				top = rect.top + rect.height / 2 - tooltipRect.height / 2;
				left = rect.right + 20;
				break;
			case 'left':
				top = rect.top + rect.height / 2 - tooltipRect.height / 2;
				left = rect.left - tooltipRect.width - 20;
				break;
			case 'top':
				top = rect.top - tooltipRect.height - 20;
				left = rect.left + rect.width / 2 - tooltipRect.width / 2;
				break;
			case 'bottom':
				top = rect.bottom + 20;
				left = rect.left + rect.width / 2 - tooltipRect.width / 2;
				break;
			default:
				top = window.innerHeight / 2 - tooltipRect.height / 2;
				left = window.innerWidth / 2 - tooltipRect.width / 2;
		}

		// Keep tooltip within viewport
		top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
		left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));

		setPosition({ top, left });
	}, [targetElement, step.position]);

	const isWelcome = step.id === 'welcome';
	const isComplete = step.id === 'complete';
	const isCenterStep = isWelcome || isComplete;

	return (
		<div
			ref={tooltipRef}
			role="dialog"
			aria-labelledby="onboarding-title"
			aria-describedby="onboarding-description"
			aria-modal="true"
			className={`
				fixed z-[100000] bg-void-bg-1 border border-void-border-1 rounded-lg shadow-2xl
				${isCenterStep ? 'transform -translate-x-1/2 -translate-y-1/2' : ''}
			`}
			style={{
				top: position.top,
				left: position.left,
				maxWidth: isCenterStep ? '500px' : '350px',
				minWidth: '280px'
			}}
		>
			{/* Header */}
			<div className="flex items-center justify-between p-4 border-b border-void-border-1">
				<div className="flex items-center gap-3">
					<div id="onboarding-title" className="text-lg font-semibold text-void-fg-1">{step.title}</div>
					<div className="text-sm text-void-fg-3">
						{currentStepIndex + 1} / {totalSteps}
					</div>
				</div>
				<button
					onClick={onClose}
					className="p-1 hover:bg-void-bg-2 rounded transition-colors"
				>
					<X className="w-4 h-4 text-void-fg-2" />
				</button>
			</div>

			{/* Content */}
			<div className="p-4">
				<p id="onboarding-description" className="text-void-fg-2 leading-relaxed mb-4">
					{step.description}
				</p>

				{/* Progress bar */}
				<div className="w-full bg-void-bg-2 rounded-full h-2 mb-4">
					<div
						className="bg-blue-500 h-2 rounded-full transition-all duration-300"
						style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
					/>
				</div>

				{/* Navigation */}
				<div className="flex items-center justify-between">
					<button
						onClick={onPrev}
						disabled={currentStepIndex === 0}
						className={`
							flex items-center gap-2 px-3 py-2 rounded transition-colors
							${currentStepIndex === 0
								? 'text-void-fg-3 cursor-not-allowed'
								: 'text-void-fg-1 hover:bg-void-bg-2'
							}
						`}
					>
						<ArrowLeft className="w-4 h-4" />
						이전
					</button>

					{isComplete ? (
						<button
							onClick={onClose}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
						>
							시작하기
							<ChevronRight className="w-4 h-4" />
						</button>
					) : (
						<button
							onClick={onNext}
							disabled={currentStepIndex === totalSteps - 1}
							className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
						>
							{isWelcome ? '시작하기' : '다음'}
							<ChevronRight className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

const Highlight = ({ targetElement }: { targetElement: HTMLElement | null }) => {
	const [rect, setRect] = useState<DOMRect | null>(null);

	useEffect(() => {
		if (!targetElement) {
			setRect(null);
			return;
		}

		const updateRect = () => {
			setRect(targetElement.getBoundingClientRect());
		};

		updateRect();

		const resizeObserver = new ResizeObserver(updateRect);
		resizeObserver.observe(targetElement);

		window.addEventListener('resize', updateRect);
		window.addEventListener('scroll', updateRect);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateRect);
			window.removeEventListener('scroll', updateRect);
		};
	}, [targetElement]);

	if (!rect) return null;

	return (
		<div
			className="fixed pointer-events-none z-[99998] border-2 border-blue-500 rounded-md"
			style={{
				top: rect.top - 2,
				left: rect.left - 2,
				width: rect.width + 4,
				height: rect.height + 4,
				boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
			}}
		/>
	);
};

export const StaticOnboarding = () => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [isVisible, setIsVisible] = useState(true);
	const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

	const accessor = useAccessor();
	const currentStep = ONBOARDING_STEPS[currentStepIndex];

	// Check if onboarding was already completed
	useEffect(() => {
		try {
			const storageService = accessor.get('IStorageService');
			const completed = storageService.get('void.staticOnboardingCompleted', 0 /* StorageScope.PROFILE */);
			if (completed === 'true') {
				setIsVisible(false);
			}
		} catch (error) {
			console.warn('Failed to check onboarding completion status:', error);
		}
	}, [accessor]);

	// Keyboard shortcuts
	useEffect(() => {
		if (!isVisible) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'Escape':
					handleClose();
					break;
				case 'ArrowRight':
				case ' ': // Space bar
					e.preventDefault();
					handleNext();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					handlePrev();
					break;
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isVisible, currentStepIndex]);

	useEffect(() => {
		if (!isVisible) return;

		if (currentStep.targetSelector) {
			// Try to find the element, with a small delay to ensure DOM is ready
			const findElement = () => {
				const element = document.querySelector(currentStep.targetSelector!) as HTMLElement;
				if (element) {
					setTargetElement(element);
				} else {
					// If element not found, try again after a short delay
					setTimeout(findElement, 100);
				}
			};
			findElement();
		} else {
			setTargetElement(null);
		}
	}, [currentStepIndex, currentStep.targetSelector, isVisible]);

	const handleNext = () => {
		if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
			setCurrentStepIndex(currentStepIndex + 1);
		}
	};

	const handlePrev = () => {
		if (currentStepIndex > 0) {
			setCurrentStepIndex(currentStepIndex - 1);
		}
	};

	const handleClose = () => {
		// Save onboarding completion status
		try {
			const storageService = accessor.get('IStorageService');
			storageService.store('void.staticOnboardingCompleted', 'true', 0 /* StorageScope.PROFILE */, 1 /* StorageTarget.MACHINE */);
		} catch (error) {
			console.warn('Failed to save onboarding completion status:', error);
		}

		setIsVisible(false);
	};

	if (!isVisible) return null;

	return (
		<div className="@@void-scope dark">
			{/* Background overlay */}
			<div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-[99997] pointer-events-auto" />

			{/* Highlight */}
			<Highlight targetElement={targetElement} />

			{/* Tooltip */}
			<Tooltip
				step={currentStep}
				targetElement={targetElement}
				onNext={handleNext}
				onPrev={handlePrev}
				onClose={handleClose}
				currentStepIndex={currentStepIndex}
				totalSteps={ONBOARDING_STEPS.length}
			/>
		</div>
	);
};

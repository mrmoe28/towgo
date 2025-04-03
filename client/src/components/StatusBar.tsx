import { StatusBarProps } from '@/types';

export default function StatusBar({
  message,
  isVisible,
  actionText,
  onAction,
  enhancedInfo
}: StatusBarProps) {
  if (isVisible === false || isVisible === undefined) {
    return null;
  }

  return (
    <div className="bg-neutral-light border-t border-neutral py-2 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col">
          <p className="text-sm text-neutral-darkest">
            <span>{message}</span>
            {actionText && onAction && (
              <button 
                className="text-accent hover:text-accent-dark ml-2"
                onClick={onAction}
              >
                {actionText}
              </button>
            )}
          </p>
          
          {enhancedInfo && enhancedInfo.originalQuery !== enhancedInfo.enhancedQuery && (
            <div className="text-xs mt-1 text-neutral-dark flex flex-col">
              <div className="flex">
                <span className="font-medium mr-1">Original:</span>
                <span>{enhancedInfo.originalQuery}</span>
              </div>
              <div className="flex">
                <span className="font-medium mr-1">Enhanced:</span>
                <span className="text-primary-dark">{enhancedInfo.enhancedQuery}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

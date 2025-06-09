  {/* Token Usage Preview */}
  <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
    <TokenUsagePreview
      total={tokenUsage.total}
      remaining={tokenUsage.remaining}
      max={tokenUsage.maxContextWindow}
      isLoading={isLoading}
      ragTokens={tokenUsage.ragTokens}
    />
  </div> 
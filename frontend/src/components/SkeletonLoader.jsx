export function TripCardSkeleton() {
  return (
    <div className="tripnest-trip-card skeleton-card">
      <div className="skeleton-image-wrap shimmer" />
      <div className="skeleton-content">
        <div className="skeleton-badge shimmer" />
        <div className="skeleton-title shimmer" />
        <div className="skeleton-line shimmer" />
        <div className="skeleton-footer">
          <div className="skeleton-pill shimmer" />
          <div className="skeleton-pill shimmer" />
        </div>
      </div>
    </div>
  );
}

export function TripGridSkeleton({ count = 3 }) {
  return (
    <div className="tripnest-trip-grid skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <TripCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function TimelineSkeleton({ count = 3 }) {
  return (
    <div className="timeline-skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="timeline-skeleton-item">
          <div className="skeleton-time shimmer" />
          <div className="skeleton-item-body">
            <div className="skeleton-badge shimmer" />
            <div className="skeleton-title shimmer" />
            <div className="skeleton-line short shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

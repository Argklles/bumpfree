import { SkeletonPulse } from "@/components/motion/SkeletonPulse";
import { Card, CardContent } from "@/components/ui/card";

export default function Loading() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <SkeletonPulse className="h-8 w-32 rounded-md" delay={0} />
                <SkeletonPulse className="h-4 w-64 rounded-md mt-2" delay={0.04} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-5 flex items-center gap-3">
                        <SkeletonPulse className="w-5 h-5 rounded-full" delay={0.08} />
                        <div>
                            <SkeletonPulse className="h-6 w-12 rounded-md mb-1" delay={0.08} />
                            <SkeletonPulse className="h-3 w-16 rounded-md" delay={0.12} />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 flex items-center gap-3">
                        <SkeletonPulse className="w-5 h-5 rounded-full" delay={0.12} />
                        <div>
                            <SkeletonPulse className="h-6 w-12 rounded-md mb-1" delay={0.12} />
                            <SkeletonPulse className="h-3 w-16 rounded-md" delay={0.16} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users List Placeholder */}
            <div className="space-y-3 mt-6">
                <SkeletonPulse className="h-5 w-24 rounded-md mb-2" delay={0.16} />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i}>
                        <CardContent className="pt-4 pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 h-[60px]">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <SkeletonPulse className="h-5 w-24 rounded-md" delay={0.20 + i * 0.04} />
                                        <SkeletonPulse className="h-5 w-16 rounded-full" delay={0.20 + i * 0.04} />
                                    </div>
                                    <SkeletonPulse className="h-3 w-32 rounded-md mt-2" delay={0.24 + i * 0.04} />
                                </div>
                                <div className="flex items-center gap-2">
                                    <SkeletonPulse className="h-7 w-28 rounded-md" delay={0.28 + i * 0.04} />
                                    <SkeletonPulse className="h-7 w-20 rounded-md" delay={0.28 + i * 0.04} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

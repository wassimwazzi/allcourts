"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/env";
import type { DiscoverCourtCard } from "@/lib/discovery-data";

interface CourtCardProps {
  court: DiscoverCourtCard;
  compact?: boolean;
}

export function CourtCard({ court, compact = false }: CourtCardProps) {
  // Surface type from description or fallback
  const surfaceType = court.description.includes("Clay") ? "Clay" :
                      court.description.includes("Grass") ? "Grass" :
                      court.description.includes("Hard") ? "Hard Court" : "Synthetic";
  
  // Check if indoor from amenities
  const isIndoor = court.amenities.some(a => a.toLowerCase().includes("indoor"));
  
  const rating = court.rating;

  return (
    <Card className="w-full max-w-sm overflow-hidden border-border bg-background shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="p-0 relative">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={court.imageUrl}
            alt={court.name}
            width={600}
            height={360}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 shadow-sm">
              {court.sport}
            </Badge>
            {isIndoor && (
              <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 border-0 shadow-sm">
                Indoor
              </Badge>
            )}
          </div>
          
          <div className="absolute top-3 right-3">
            {rating !== null && (
              <div className="bg-lime-100 text-lime-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                {rating.toFixed(1)}
              </div>
            )}
          </div>
          
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-xl drop-shadow-lg">{court.name}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="text-sm">{court.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Capacity</p>
              <p className="font-medium text-foreground">{court.capacity}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="w-8 h-8 rounded-full bg-lime-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-lime-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Surface</p>
              <p className="font-medium text-foreground">{surfaceType}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-muted-foreground">{court.availability}</span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Price per hour</p>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(court.priceFrom)}
            <span className="text-sm font-normal text-muted-foreground">/hr</span>
          </p>
        </div>
        <Button 
          asChild
          className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all duration-300"
        >
          <Link href={compact ? "/checkout" : `/checkout/${court.id}`}>
            Reserve Now
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

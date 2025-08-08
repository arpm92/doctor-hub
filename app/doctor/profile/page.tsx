import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Edit, Camera, Share2 } from 'lucide-react';

const ProfilePage = () => {
  const router = useRouter();

  return (
    <div>
      {/* Profile Information */}
      <div className="mb-4">
        {/* Display profile information here */}
      </div>

      {/* Profile Actions */}
      <div className="flex gap-2">
        <Button onClick={() => router.push("/doctor/profile/edit")}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Perfil
        </Button>
        <Button variant="outline" onClick={() => router.push("/doctor/profile/photo")}>
          <Camera className="h-4 w-4 mr-2" />
          Cambiar Foto
        </Button>
        <Button variant="outline" onClick={() => router.push("/doctor/profile/social")}>
          <Share2 className="h-4 w-4 mr-2" />
          Redes Sociales
        </Button>
      </div>

      {/* Additional Profile Sections */}
      <div className="mt-4">
        {/* Additional sections like appointments, reviews, etc. */}
      </div>
    </div>
  );
};

export default ProfilePage;
